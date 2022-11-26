const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
  description: { type: String, required: true, minLength: 3, maxLength: 2000 },
  price: { type: Number, required: true, min: 0 },
  number_in_stock: { type: Number, min: 0, default: 0 },
  category: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
  weight: { type: Number, default: "N/A" },
  image: { type: String, required: false },
});

// ItemSchema.virtual("url").get(function () {
//   return `/shop/${this.category}/${this._id}`;
// });

module.exports = mongoose.model("Item", ItemSchema);
