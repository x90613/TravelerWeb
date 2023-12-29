import { motion } from "framer-motion";

const floatVariants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const HoverImage = ({ src, alt }) => {
  return (
    <motion.img
      src={src}
      alt={alt}
      variants={floatVariants}
      initial="rest"
      whileHover="hover"
      className="your-image-class" // 根据需要替换或删除
    />
  );
};

export default HoverImage;
