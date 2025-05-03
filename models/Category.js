const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    image: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
