import Stripe from "stripe";
import Order from "../model/Order.js";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const planPriceIds = {
  monthly: "price_1R9TpFRHjN8gAvkjtLEDIsjP",
};

const stripeWebhookHandler = async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (err) {
    console.log(err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "paid";

    await order.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req, res) => {
  try {
    const { email, plan } = req.body;

    const newOrder = new Order({
      plan: plan,
      user: req.userId,
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Create a checkout session
    const session = await STRIPE.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: planPriceIds[plan], // The ID of the price object in Stripe
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/pricing`,
      metadata: {
        planDuration: plan,
        orderId: newOrder._id.toString(),
        userId: req.userId,
      },
    });

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    await newOrder.save();

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.raw.message });
  }
};

export default { createCheckoutSession, stripeWebhookHandler };
