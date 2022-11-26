const express = require("express");
const router = express.Router();

// Controller modules
const shop_Controller = require("../controllers/shopController");

// Set up multer for storing uploaded files
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = "./public/images";
    cb(null, path);
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get HOME page
router.get("/", shop_Controller.index);

// Create ITEMS & CATEGORIES
router.get("/items/create", shop_Controller.item_create_get);

router.post(
  "/items/create",
  upload.single("image"),
  shop_Controller.item_create_post
);

router.get("/category/create", shop_Controller.category_create_get);

router.post("/category/create", shop_Controller.category_create_post);

// Delete ITEMS & CATEGORIES
router.get("/:categoryname/:id/delete", shop_Controller.item_delete_get);

router.post("/:categoryname/:id/delete", shop_Controller.item_delete_post);

router.get("/:name/delete", shop_Controller.category_delete_get);

router.post("/:name/delete", shop_Controller.category_delete_post);

// Update ITEMS & CATEGORIES
router.get("/:category_name/:id/update", shop_Controller.item_update_get);

router.post(
  "/:category_name/:id/update",
  upload.single("image"),
  shop_Controller.item_update_post
);

router.get("/:category_name/update/:id", shop_Controller.category_update_get);

router.post("/:category_name/update/:id", shop_Controller.category_update_post);

// Get ITEM details
router.get("/:name", shop_Controller.item_list);

router.get("/:name/:id", shop_Controller.item_detail);

module.exports = router;
