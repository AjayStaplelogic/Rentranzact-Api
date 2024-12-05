import mongoose from "mongoose";
import { BANNER_PAGES_ENUMS } from "../enums/banner.enums.mjs";
const Schema = mongoose.Schema;

const bannerSchema = new Schema(
  {
    page: {
      type: String,
      enum: Object.values(BANNER_PAGES_ENUMS),
    },
    title: {
      type: String,
    },
    media: {
      type: String,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    unpublishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: true,
    toObject: true,
  }
);

const Banners = mongoose.model("Banners", bannerSchema);
export default Banners;
