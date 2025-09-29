import React from "react";
import { Image, Stack } from "react-bootstrap";
import "./Support.css"; // add the CSS here

function Support() {
    const items = [
        {
            img: "/assets/img/support/support-1.png",
            title: "Free Shipping",
            text: "Free shipping on all orders",
        },
        {
            img: "/assets/img/support/support-2.png",
            title: "Support 24/7",
            text: "We are here to help anytime",
        },
        {
            img: "/assets/img/support/support-3.png",
            title: "Money Return",
            text: "Return money in case of issues",
        },
        {
            img: "/assets/img/support/support-4.png",
            title: "Order Discount",
            text: "Discounts on selected orders",
        },
    ];

    return (
        <Stack
            direction="horizontal"
            gap={3}
            className="justify-content-center p-lg-5 p-3 d-block text-center"
        >
            {items.map((item, i) => (
                <div key={i} className="p-2 d-inline-flex gap-1 align-items-center">
                    <Image src={item.img} alt={item.title} className="support-icon" />
                    <Stack>
                        <h6 className="mb-0">{item.title}</h6>
                        <p className="mb-0">{item.text}</p>
                    </Stack>
                </div>
            ))}
        </Stack>
    );
}

export default Support;
