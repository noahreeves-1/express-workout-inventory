const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 300 },
});

CategorySchema.virtual("url").get(function () {
  return `/shop/${this.name}`;
});

module.exports = mongoose.model("Category", CategorySchema);
