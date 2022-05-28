const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//import mongoose schema
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");
const Review = require("./Review");

const port = process.env.PORT || 5000;
// Replace the following with your MongoDB deployment's connection string.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7iqzh.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri, () => {
  ("DB connected");
});

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
  });

  next();
}

app.get("/", (req, res) => {
  res.send(`server is running on port ${port}`);
});

app.post("/insert-product", verifyJWT, (req, res) => {
  const pdData = req.body;
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  const userRole = req.query.role;

  if (decodedUid === userId && userRole === "admin") {
    const run = async () => {
      try {
        const product = await Product.create(pdData);
        res.send(product);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/find-product", (req, res) => {
  req.body;
  const pdData = req.query.id;
  const run = async () => {
    try {
      const product = await Product.findById(pdData);
      //   (product)
      res.send(product);
    } catch (e) {
      e;
    }
  };
  run();
});

app.get("/home-product", (req, res) => {
  req.body;
  const pdData = req.query.id;
  const run = async () => {
    try {
      const product = await Product.find().limit(8);
      res.send(product);
    } catch (e) {
      e;
    }
  };
  run();
});

app.get("/all-product", (req, res) => {
  req.body;
  const pdData = req.query.id;
  const run = async () => {
    try {
      const product = await Product.find();
      res.send(product);
    } catch (e) {
      e;
    }
  };
  run();
});

app.delete("/delete-one", (req, res) => {
  const id = req.query.id;
  const run = async () => {
    try {
      const product = await Product.findByIdAndDelete(id);
      res.send(product);
    } catch (e) {
      e;
    }
  };
  run();
});

app.put("/update-product", (req, res) => {
  req.body;
  const id = req.query.id;
  const run = async () => {
    try {
      const product = await Product.findByIdAndUpdate(id, req.body);
      const data = await Product.findById(id);

      res.send(data);
    } catch (e) {
      e;
    }
  };
  run();
});

app.post("/login", async (req, res) => {
  const userData = req.body;
  const { uid, email, displayName: name } = userData;
  uid, email;
  const user = {
    name,
    email,
    uid,
    role: "user",
  };

  //   const accessToken = jwt.sign(user, process.env.JWT, {
  //     expiresIn: "1d",
  //   });
  const run = async () => {
    try {
      const existUser = await User.find({ uid });
      if (existUser.length === 0) {
        const newUser = await User.create(user);
        const accessToken = await jwt.sign(user, process.env.JWT, {
          expiresIn: "1d",
        });
        const { role } = newUser;
        const { uid } = newUser;
        const { _id } = newUser;
        res.send({ accessToken, role, uid, _id });
      } else {
        const { _id, uid, email, role } = existUser[0];
        const user = { _id, uid, email, role };
        const accessToken = await jwt.sign(user, process.env.JWT, {
          expiresIn: "1d",
        });
        res.send({ accessToken, role, uid, _id });
      }
    } catch (e) {
      e;
    }
  };
  run();
});
app.post("/update-user-data", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  const id = req.query.id;
  const userData = req.body;

  const { user_phone: phone, user_address: address } = userData;

  if (decodedUid === userId) {
    const run = async () => {
      try {
        const userData = await User.findById(id);
        if (phone) {
          userData.phone = phone;
          await userData.save();
        }
        if (address) {
          userData.address = address;
          await userData.save();
        }
        const data = await User.findById(id);
        res.status(200).send(data);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/all-user", verifyJWT, (req, res) => {
  const decodedUid = req.decoded.uid;
  const decodedRole = req.decoded.role;
  const uid = req.query.uid;

  if (decodedUid === uid && decodedRole === "admin") {
    const run = async () => {
      try {
        const users = await User.find();
        res.send(users);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/user-data", verifyJWT, (req, res) => {
  const decodedUid = req.decoded.uid;
  const uid = req.query.uid;

  if (decodedUid === uid) {
    const run = async () => {
      try {
        const user = await User.where("uid").equals(uid);
        res.send(user);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.post("/add-to-cart", verifyJWT, (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  "add to cart clicked", userId;

  req.body;
  const { pdId, uid, qnt, bill } = req.body;
  const qntInt = parseInt(qnt);
  const order = {
    product_id: pdId,
    customer_uid: userId,
    order_qnt: qntInt,
    order_status: "unpaid",
    order_bill: bill,
  };

  if (decodedUid === userId) {
    const run = async () => {
      try {
        const orderData = await Order.create(order);
        orderData;
        res.status(200).send(orderData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/cart", verifyJWT, (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;

  if (decodedUid === userId) {
    const run = async () => {
      try {
        const cartData = await Order.where("customer_uid")
          .equals(`${userId}`)
          .populate("product_id");
        res.status(200).send(cartData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/order-info", verifyJWT, (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  const orderId = req.query.orderId;

  if (decodedUid === userId) {
    const run = async () => {
      try {
        const orderData = await Order.findById(orderId).populate("product_id");
        res.status(200).send(orderData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.post("/create-payment-intent", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.body.uid;
  const orderId = req.body.orderId;
  if (decodedUid === userId && orderId) {
    const run = async () => {
      try {
        const orderData = await Order.findById(orderId);
        const billAmount = orderData.order_bill * 100;
        // Create a PaymentIntent with the order amount and currency
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: billAmount,
            currency: "usd",
            payment_method_types: ["card"],
          });

          res.status(200).send({
            clientSecret: paymentIntent.client_secret,
          });
        } catch (e) {
          e;
        }
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.post("/update-payment-info", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.body.uid;
  const orderId = req.body.orderId;
  const tnxId = req.body.tnxId;

  userId, orderId, tnxId;

  if (decodedUid === userId) {
    const run = async () => {
      try {
        const orderData = await Order.findById(orderId);
        orderData;
        orderData.tnx_id = tnxId;
        await orderData.save();
        orderData.order_status = "paid";
        await orderData.save();
        // orderData.tnx_id
        res.status(200).send(orderData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/all-order", verifyJWT, (req, res) => {
  const decodedUid = req.decoded.uid;
  const decodedRole = req.decoded.role;
  const uid = req.query.uid;
  if (decodedUid === uid && decodedRole === "admin") {
    const run = async () => {
      try {
        const allOrderData = await Order.find().populate("product_id");
        res.status(200).send(allOrderData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.post("/add-review", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  const id = req.query.id;
  const review = req.query.review;

  req.body;
  const reviewData = {
    review,
    user_id: id,
  };

  if (decodedUid === userId) {
    const run = async () => {
      try {
        const review = await Review.create(reviewData);
        res.send(review);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.get("/all-review", async (req, res) => {
  const run = async () => {
    try {
      const reviews = await Review.find().populate("user_id");
      reviews;
      res.send(reviews);
    } catch (e) {
      e;
    }
  };
  run();
});

app.post("/make-admin", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  const id = req.query.makeAdmin;
  const userRole = req.query.role;

  if (decodedUid === userId && userRole === "admin") {
    const run = async () => {
      try {
        const userData = await User.findById(id);
        userData.role = "admin";
        await userData.save();

        const data = await User.find();
        res.status(200).send(data);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.post("/ship", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.query.uid;
  const id = req.query.ship;
  const userRole = req.query.role;

  if (decodedUid === userId && userRole === "admin") {
    const run = async () => {
      try {
        const orderData = await Order.findById(id);
        orderData.order_status = "shipped";
        await orderData.save();
        res.status(200).send(orderData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.post("/delete-order", verifyJWT, async (req, res) => {
  const decodedUid = req.decoded.uid;
  const userId = req.body.uid;
  const orderId = req.body.id;
  orderId;
  if (decodedUid === userId) {
    const run = async () => {
      try {
        await Order.deleteOne({ _id: orderId });
        const orderData = await Order.find();

        res.status(200).send(orderData);
      } catch (e) {
        e;
      }
    };
    run();
  } else {
    return res.status(403).send({ message: "Forbidden access" });
  }
});

app.listen(port, () => {
  `server is running on port ${port}`;
});
