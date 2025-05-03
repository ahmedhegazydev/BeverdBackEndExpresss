const videoSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    videoUrl: String,
    caption: String,
    thumbnail: String,
    isActive: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
