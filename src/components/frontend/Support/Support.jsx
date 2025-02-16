import React from "react";
import { Image, Stack } from "react-bootstrap";

function Support() {
  return (
    <Stack direction="horizontal" gap={3} className="justify-content-center p-lg-5 p-3 d-block text-center">
        <div className="p-2 d-inline-flex gap-1 align-items-center">
            <Image src="/assets/img/support/support-1.png" width={50} height={50} alt="First slide" />
            <Stack>
                <h6 className="mb-0">{ 'Free Shipping' }</h6>
                <p className="mb-0">{ 'Free shipping on all orders' }</p>
            </Stack>
        </div>
        <div className="p-2 d-inline-flex gap-1 align-items-center">
            <Image src="/assets/img/support/support-2.png" width={50} height={50} alt="First slide" />
            <Stack>
                <h6 className="mb-0">{ 'Support 24/7' }</h6>
                <p className="mb-0">{ 'We are here to help anytime' }</p>
            </Stack>
        </div>
        <div className="p-2 d-inline-flex gap-1 align-items-center">
            <Image src="/assets/img/support/support-3.png" width={50} height={50} alt="First slide" />
            <Stack>
                <h6 className="mb-0">{ 'Money Return' }</h6>
                <p className="mb-0">{ 'Return money in case of issues' }</p>
            </Stack>
        </div>
        <div className="p-2 d-inline-flex gap-1 align-items-center">
            <Image src="/assets/img/support/support-4.png" width={50} height={50} alt="First slide" />
            <Stack>
                <h6 className="mb-0">{ 'Order Discount' }</h6>
                <p className="mb-0">{ 'Discounts on selected orders' }</p>
            </Stack>
        </div>
    </Stack>
  );
}

export default Support;
