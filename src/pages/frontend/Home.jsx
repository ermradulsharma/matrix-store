import React from "react";
import CasualSlider from "../../components/frontend/CasualSlider/CasualSlider";
import Support from "../../components/frontend/Support/Support";
import ProductList from "../../components/frontend/ProductList/ProductList";

function Home() {
    return (
        <>
            <CasualSlider />
            <Support />
            <ProductList />
        </>
    );
}

export default Home;
