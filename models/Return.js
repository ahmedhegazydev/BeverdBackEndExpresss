const returnSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    product: {
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
      },
      amount: Number,
    },
    status: {
      type: String,
      enum: ['requested', 'processing', 'refunded'],
      default: 'requested',
    },
    history: [
      {
        action: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Return', returnSchema);
