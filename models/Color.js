import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  hex: String,
  rgb: {
    r: Number,
    g: Number,
    b: Number,
  },
  hsl: {
    hue: Number,
    saturation: Number,
    lightness: Number,
  },
});

const Color = mongoose.models.Color || mongoose.model('Color', colorSchema);

export default Color;
