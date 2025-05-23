import { Helmet } from "react-helmet";
import { Box } from "@mui/material";
import HeroBanner from "../components/home/HeroBanner";
import CategorySection from "../components/home/CategorySection";
import FreeShippingTips from "../components/home/FreeShippingTips";
import StoreAdvantages from "../components/home/StoreAdvantages";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Garden Tools - Товари для саду та городу</title>
        <meta
          name="description"
          content="Купуйте якісні садові інструменти, системи поливу, рослини, добрива та багато іншого для вашого саду та городу."
        />
      </Helmet>

      <Box>
        <HeroBanner />
        <FreeShippingTips />
        <StoreAdvantages />
        <CategorySection />
      </Box>
    </>
  );
};

export default HomePage;
