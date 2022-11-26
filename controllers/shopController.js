const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");
const async = require("async");
const fs = require("fs");

exports.index = (req, res, next) => {
  Category.find().exec((err, list_category) => {
    if (err) {
      return next(err);
    }
    res.render("index", {
      title: "Beast's Cave",
      category_list: list_category,
    });
  });
};

exports.item_list = (req, res, next) => {
  async.waterfall(
    [
      (callback) => {
        Category.findOne({ name: req.params.name }).exec(function (
          err,
          category
        ) {
          callback(null, category);
        });
      },
      (category, callback) => {
        Item.find({ category: category.id })
          .populate("category")
          .exec(function (err, items_list) {
            callback(null, { items_list, category });
          });
      },
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.items_list === null) {
        const err = new Error(`No items found for ${results.category.name}.`);
        err.status = 404;
        return next(err);
      }
      res.render("items_list", {
        title: results.category.name,
        list_items: results.items_list,
        category: results.category,
      });
    }
  );
};

exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item === null) {
        const err = new Error(`Item ${item.name} not found`);
        err.status = 404;
        return next(err);
      }
      res.render("item_detail", {
        title: item.name,
        categories: item.category,
        item,
      });
    });
};

exports.item_create_get = (req, res) => {
  Category.find().exec((err, categories) => {
    if (err) {
      return next(err);
    }
    res.render("item_form", {
      title: "Create Item",
      categories,
    });
  });
};

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  // Validation
  body("name", "Name must not be empty")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 3, max: 2000 })
    .escape(),
  body("price", "Price must be at least $0.01").trim().isFloat().escape(),
  body("number_in_stock").trim().escape(),
  body("weight").trim().escape(),
  body("category.*").escape(),
  body("image").escape(),
  // Process request after validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    const receivedPath = req.file.path;
    const cleanedPath = receivedPath.slice(6);
    // Create new Item object with cleansed data
    const newItem = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      weight: req.body.weight,
      category: req.body.category,
      image: cleanedPath,
    });
    // Check for any error messages from the validation result
    if (!errors.isEmpty()) {
      // The errors array is not empty
      Category.find().exec((err, categories) => {
        if (err) {
          return next(err);
        }
        // Mark selected categories as checked
        for (const category of categories) {
          if (newItem.category.includes(category._id)) {
            category.checked = "true";
          }
        }
        // And render
        res.render("item_form", {
          title: "Create Item",
          categories,
          item: newItem,
          errors: errors.array(),
        });
      });
      return;
    }

    newItem.save(
      Category.findById(newItem.category[0]._id).exec((err, category) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/shop/${category.name}/${newItem._id}`);
      })
    );
  },
];

exports.item_delete_get = (req, res) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      if (item === null) {
        res.redirect(`/shop/${item.category.name}`);
      }
      res.render("item_delete", {
        title: `Delete ${item.name}`,
        item,
      });
    });
};

exports.item_delete_post = (req, res) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
      if (err) {
        return next(err);
      }
      fs.unlink("./public" + item.image, (err) => {
        console.log(err);
      });
      // Sucesss - item found. Delete book and redirect to list of items
      Item.findByIdAndRemove(item._id, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/shop`);
      });
    });
};

exports.item_update_get = (req, res, next) => {
  // Get item by ID and all categories
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.categories === null) {
        const err = new Error("Categories not found");
        err.status = 404;
        return next(err);
      }
      // Success no errors
      for (const category of results.categories) {
        for (const itemCategory of results.item.category) {
          if (category._id.toString() === itemCategory._id.toString()) {
            category.checked = "true";
          }
        }
      }
      // Depends
      res.render("item_form", {
        title: "Update Item",
        item: results.item,
        categories: results.categories,
      });
    }
  );
};

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  // Validation
  body("name", "Name must not be empty")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 3, max: 2000 })
    .escape(),
  body("price", "Price must be at least $0.01").trim().isFloat().escape(),
  body("number_in_stock").trim().escape(),
  body("weight").trim().escape(),
  body("category.*").escape(),
  body("image").escape(),
  // Process request after validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    // Clean file path for image
    const receivedPath = req.file.path;
    const cleanedPath = receivedPath.slice(6);
    // Create new Item object with cleansed data
    const newItem = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      weight: req.body.weight,
      category: req.body.category,
      image: cleanedPath,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // The errors array is not empty
      Category.find().exec((err, categories) => {
        if (err) {
          return next(err);
        }
        // Mark selected categories as checked
        for (const category of categories) {
          if (newItem.category.includes(category._id)) {
            category.checked = "true";
          }
        }
        // And render
        res.render("item_form", {
          title: "Create Item",
          categories,
          item: newItem,
          errors: errors.array(),
        });
      });
      return;
    }

    Item.findByIdAndUpdate(req.params.id, newItem, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }
      Category.findById(theitem.category[0]._id).exec((err, category) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/shop/${category.name}/${theitem._id}`);
      });
    });
  },
];

// CATEGORY CONTROLLERS

exports.category_create_get = (req, res) => {
  res.render("category_form", {
    title: "Create Category",
  });
};

exports.category_create_post = [
  // Validation
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category must be specified")
    .isAlphanumeric()
    .withMessage("Cateogry has non-alpha numeric characters"),
  body("description", "Description is required")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Proces request after validation and sanitazation
  (req, res, next) => {
    const errors = validationResult(req);

    const newCategory = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors - render form again with sanitized values and error messages(s)
      res.render("category_form", {
        title: "Create Category",
        category: newCategory,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findOne({ name: req.body.name }).exec((err, found_category) => {
        if (err) {
          return next(err);
        }
        if (found_category) {
          res.redirect(found_category.url);
        } else {
          // Data from form is valid. Create new category object with escaped and trimmed data
          newCategory.save((err) => {
            if (err) {
              return next(err);
            }
            res.redirect(newCategory.url);
          });
        }
      });
    }
  },
];

exports.category_delete_get = (req, res, next) => {
  async.waterfall(
    [
      (callback) => {
        Category.findOne({ name: req.params.name }).exec((err, category) => {
          callback(null, category);
        });
      },
      (category, callback) => {
        Item.find({ category: category._id })
          .populate("category")
          .exec(function (err, items_list) {
            callback(null, { items_list, category });
          });
      },
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category === null) {
        // no category object found
        res.redirect("/shop");
      }
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        list_items: results.items_list,
      });
    }
  );
};

exports.category_delete_post = (req, res) => {
  async.waterfall(
    [
      (callback) => {
        Category.findOne({ name: req.params.name }).exec((err, category) => {
          callback(null, category);
        });
      },
      (category, callback) => {
        Item.find({ category: category.id })
          .populate("category")
          .exec(function (err, items_list) {
            callback(null, { items_list, category });
          });
      },
    ],
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.items_list.length > 0) {
        // Category has books. Render again but with message that
        // all books need to be deleted
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          list_items: results.items_list,
        });
        return;
      }
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) {
          return next(err);
        }
        // Success
        res.redirect("/shop");
      });
    }
  );
};

exports.category_update_get = (req, res, next) => {
  Category.findOne({ name: req.params.category_name }).exec((err, category) => {
    if (err) {
      next(err);
    }
    res.render("category_form", {
      title: "Update Category",
      category,
    });
  });
};

exports.category_update_post = [
  // Validation
  body("name", "Category name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // After validation
  (req, res, next) => {
    // Get any errors from validation and sanitization
    const errors = validationResult(req);
    // Create new category
    const newCategory = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });
    // Found errors
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        newCategory,
        errors: errors.array(),
      });
      return;
    } else {
      Category.findByIdAndUpdate(
        req.params.id,
        newCategory,
        {},
        (err, found_category) => {
          if (err) {
            return next(err);
          }
          res.redirect(newCategory.url);
        }
      );
    }
  },
];
