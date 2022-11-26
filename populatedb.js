#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/inventory_management?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
const Category = require("./models/category");
const Item = require("./models/item");

const categories = [];
const items = [];

const mongoose = require("mongoose");
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

function categoryCreate(name, description, cb) {
  categorydetail = { name: name, description: description };

  const category = new Category(categorydetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(
  name,
  description,
  price,
  number_in_stock,
  category,
  weight,
  cb
) {
  itemdetail = {
    name: name,
    description: description,
    price: price,
    category: category,
    weight: weight,
  };
  if (number_in_stock != false) itemdetail.number_in_stock = number_in_stock;

  const item = new Item(itemdetail);

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "Protein Shakes",
          "A protein drink consumed before or after a workout in order to aid in muscle/recovery.",
          callback
        );
      },
      (callback) => {
        categoryCreate(
          "Shaker Bottles",
          "Bottles that you can use to quickly mix together protein shakes. These bottles typically come with an airtight lid and a mixing ball at the bottom, which breaks apart the powders and extra ingredients poured inside.",
          callback
        );
      },
      (callback) => {
        categoryCreate(
          "Creatine",
          "Creatine is an amino acid located mostly in your body's muscles as well as in the brain. It helps your muscles produce energy during heavy lifting or high intensity exercise.",
          callback
        );
      },
      (callback) => {
        categoryCreate(
          "Protein Bars",
          "Nutrition bars that contain a high proportion of protein to carbohydrates and fats",
          callback
        );
      },
      (callback) => {
        categoryCreate(
          "Preworkout",
          "A supplement to boost your energy and oxygen delivery to your muscles during your workout",
          callback
        );
      },
    ],
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      (callback) => {
        itemCreate(
          "JYM Supplement Science Pro JYM Protein Powder",
          "Pro JYM is a premium protein powder, an ideal blend of the three most effective types of proteins for building muscle: whey, micellar casein, and egg protein. In synergy with Pre JYM and Post JYM, Pro JYM is your go-to protein both before and after intense workouts. Pro JYM is also the most delicious protein on the market!",
          39.99,
          10,
          [categories[0]],
          32,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "MuscleTech Nitro-Tech Ripped Protein",
          "The brand with more than two decades of excellence brings you Nitro-Tech® Ripped, an advanced formula designed to amp up the performance of fitness enthusiasts far and wide. Nitro-Tech® Ripped is our highly customized whey protein formula that combines the highest quality whey protein peptides and isolate with C. canephora robusta – a scientifically tested weight loss ingredients to support you in your quest to look your best. It’s the ultimate protein plus weight loss formula available to those who refuse to accept the status quo.",
          69.99,
          5,
          [categories[0], categories[2]],
          64,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Dymatize ISO100 Hydrolyzed Whey Protein Isolate",
          "ISO100 is simply muscle-building fuel. If your goal is gaining muscle size and strength, then ISO100 is your perfect workout partner. Loaded with muscle-building amino acids, ISO100 can support even the most serious resistance-training programs.",
          132.99,
          3,
          [categories[0]],
          80,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "EVLUTION NUTRITION 100% Whey Protein Isolate",
          "Whey Protein Isolates are the purest, highest quality form that exists and the only form we use in Evlution Nutrition’s 100% Isolate Protein. Our 100% Isolate Protein is made from pure Whey Protein Isolate with no rBST hormones. It’s the fastest form of whey protein to absorb and the ideal body and muscle fuel before a workout to supply muscles with essential amino acids and post workout to recover faster and stronger. Plus, we use best in class ingredients from the highest quality manufacturing to ensure what you put inside creates the best results outside.",
          44.99,
          25.6,
          [categories[0]],
          90,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "EVLUTION NUTRITION Stacked Plant Protein",
          "Stacked Plant Protein is the evolution of clean, delicious All-in-One Vegan Protein with 20 grams of complete protein containing all 9 essential amino acids, BCAAs and Glutamine to help you train and recover. Plus, Stacked Plant Protein has a healthy 1 billion CFU of Probiotics, 6 grams of fiber, natural digestive enzymes, and a greens blend. Stacked Plant Protein never compromises on clean ingredients. Our plant protein is soy free, gluten free, non-GMO and has no artificial colors, sweeteners, flavors, fillers or preservatives. Plus, the clean nutritional profile means you get what you want and nothing else with only 2 grams of sugar.",
          39.99,
          1,
          [categories[0]],
          24,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Gaspari Nutrition Proven Egg",
          `All-natural, 100% Proven® Egg White Protein from Gaspari Nutrition is finally here! Nature’s PROVEN most efficient muscle building protein comes packed with 25g of the highest quality protein, 0g fat, and loaded with 8g of BCAAs per serving.

        EGG PROTEIN IS THE MOST COMPLETE PROTEIN WHEN COMPARED TO ALL OTHER ANIMAL & PLANT-BASED SOURCES.
        To build a muscular physique you must consume sufficient doses of high-quality protein on a daily basis. Unfortunately, getting enough high-quality protein from our diet can be a challenge for most of us. With so many protein supplements on the market, it is difficult to choose the best option. Gaspari’s Proven® 100% Egg White Protein is clinically the purest protein source when considering its essential amino acid composition, digestibility and bioavailability of amino acids. There are several measurement scales and techniques that are used to evaluate the quality of protein, and egg protein is rated number one in all rating scales.
        
        Data proves that egg protein is over 21% more efficient than whey when it comes to building lean muscle mass. If you are looking for nature’s best protein source to build a quality physique , look no further than Gaspari Nutrition’s Proven® 100% Egg White Protein.`,
          60.99,
          false,
          [categories[0]],
          80,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Kaged KASEIN Casein Protein",
          "Kasein is the perfect protein formula for anyone looking to fuel more lean, impressive muscle. The truth is, we’re missing out on major gains while our bodies are deprived of nutrients and amino acids overnight. Kasein solves that problem by providing your muscles a slow and steady stream of micellar casein protein and amino acids, ensuring you’re maximizing your anabolic environment for muscle growth and recovery while you sleep.",
          39.99,
          3,
          [categories[0]],
          100,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Kaged BlenderBottle Classic",
          "The BlenderBottle Classic revolutionized the industry in 2004 with its leak-proof seal, iconic design, and the BlenderBall wire whisk. At work, at home, or at the gym, the Kaged Muscle BlenderBottle delivers smooth, mess-free shakes every time.",
          8.99,
          4,
          [categories[1]],
          4,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "JNX Sports The Curse! Skull Shaker",
          "There’s no better way to fuel your workouts than with this JNX Sports custom-molded shaker featuring the iconic Curse! skull design.",
          11.99,
          2,
          [categories[1]],
          5,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Hydro Sleeve",
          "Our Sleeves are made from premium neoprene to help eliminate condensation and insulate your HydroJug. The HydroJug sleeve is fitted with a pocket for your cell phone (fits iPhone 11 plus size phones) as well as an accessory pocket for keys or headphones. Add your personal touch to your HydroJug and leave boring water bottles behind!",
          19.99,
          false,
          [categories[1]],
          3,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "NHK Ultimate Double Blender",
          "This bottle brings the best of both worlds - the ultimate blending experience and two shaker balls. Each blending ball is optimized to break down small and large particles so that your protein shake never clumps together! Our patented blender bottle is guaranteed to mix perfectly every time or your money back!",
          19.99,
          4,
          [categories[1]],
          5,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Cellucor C4 Dynasty",
          `Combining part art, part science, and a couple heaping scoops of obsession, C4 Dynasty is an extreme pre-workout only Cellucor could make. We are the pioneers of pre-workout performance. The masters of explosive energy. C4 Dynasty combines 10 years of cutting-edge innovation, industry research, and expertise. Pre-workout is our domain, and C4 Dynasty is King.`,
          69.99,
          4,
          [categories[0], categories[2]],
          19.6,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "PharmaFreak Creatine Freak Hydration",
          "New CREATINE FREAK HYDRATION MIX was designed to provide hydration support with the added benefits of clinically proven micronized creatine monohydrate for muscle performance plus CherryPURE the only Prunus cerasus ingredient supported by multiple human clinical trials analyzing muscle recovery and markers of inflammation. What’s more? CREATINE FREAK HYDRATION MIX is free of artificial sweeteners, flavors, dyes and colors!",
          31.99,
          4,
          [categories[2]],
          12,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Controlled Labs Green Bulge",
          `Green Bulge one is one of our most advanced creatine matrix volumizers. It combines Magnesium Creatine Chelate (MCC), a patented form of creatine, with Dicreatine Malate (2CM) to deliver synergistic benefits.

        CONTROLLED LABS has responded to customer demand and the result: Green BULGE new and improved, delivering a synergistic formula you can actually feel working during your workouts. The exclusive stimulant-free HyperBULGE complex features Curcuminoids, GYMnemic Acid, and more…. boosting performance while taking muscle recovery / regeneration to the next level. The HyperCRE complex features a potent combination of patented Magnesium Creatine Chelate and 2CM (Dicreatine Malate), beneficial during both anaerobic and aerobic workouts. Featuring clinically surmised active ingredients and potent B Vitamins.
        
        Discover what many natural athletes already know…. Green BULGE DELIVERS!`,
          31.99,
          false,
          [categories[2]],
          15.34,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "EVLUTION NUTRITION Creatine 5000",
          `Highest Quality Pure Micronized Creatine

        When it comes to building muscle, creatine monohydrate is the most researched form that’s known as the #1 supplement for improving performance in the gym. Evlution Nutrition’s 100% Micronized Creatine 5000 supports your muscle cells capacity to produce more energy to boost performance, power, strength and muscle growth. And it’s always made with the highest quality to help make sure what you put inside produces the best results outside!`,
          34.99,
          3,
          [categories[2]],
          10.56,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Barebells Plant Based Protein Bar",
          "Barebells plant-based bars are 100% vegan and dairy-free, with 15 grams of protein, no added sugar, and no palm oil. Available in two irresistible flavors: Salty Peanut and Hazelnut Nougat. Plant-based, same great taste! Each bar boasts 15g of plant-based protein derived from soy, peas, and rice.",
          31.02,
          4,
          [categories[3]],
          34.7,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Quest Nutrition Quest Bars",
          "Quest Protein Bars are made with complete dairy proteins to provide your body with all nine of the essential amino acids it needs. We use custom recipes to create our own chocolate flavored chips, cookie pieces, and other inclusions to make every bite as delicious as your cravings.",
          35.99,
          11,
          [categories[3]],
          66.02,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Chef Robert Irvine FIT Crunch Bars",
          `Delicious six layer whey isolate protein bar created by celebrity chef Robert Irvine.

        Built like no other. Tastes like no other.`,
          37.99,
          false,
          [categories[3]],
          54.7,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Convenient Nutrition Keto Wheyfer",
          `KETOGENIC NUTRITION
        The Keto Wheyfer is a great tasting Ketogenic Nutrition wafer bar that tastes closer to a desert than a protein or energy bar. Light and crunchy, delectably delicious, very much resembling the wafer cookies you remember eating as a kid. But don’t let this delicious wafer fool you! The Keto Wheyfer is packed with 9-11 grams of collagen enhanced protein, MCT’s, and 200 calories per serving. The Keto Wheyfer will fill you up and leave you satisfied and hunger free for hours.
        
        KETO FRIENDLY
        4-6 net grams of carbohydrates per Keto Wheyfer.
        
        TASTES LIKE DESSERT
        1-2 grams of sugar per Keto Wheyfer. Perfect for snacks, dieting, pre and post exercise, desserts and anytime you’re looking for something good for you that taste great, whether you’re on a keto diet or not.
        
        PROTEIN
        Our unique protein blend offers 9-11 grams of highly digestible protein per serving. Including 5 grams of Collagen protein. Recent research on Collagen protein shows many benefits including healthy joints, bones, tendons, hair, skin, nails, muscles and more.
        
        FAT BLEND
        Consisting of Coconut and Palm Oil. Both coconut and palm oil are high in MCT’s (medium-chain triglycerides). MCT’s are easily digested and provide instant energy to support metabolism and fuel.
        
        NO SUGAR ALCOHOLS
        You’ll never feel bloated after eating a Keto Wheyfer.
        
        LIGHT, SWEET, AND CRUNCHY
        No after taste. Unlike other keto and low carb snacks that tend to be dry and bland, the Keto Wheyfer is the perfect blend of cream and crunch!`,
          19.99,
          5,
          [categories[3]],
          24.7,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Berg Bites",
          "For satisfying your sweet tooth and for a handy, nutrient-dense snack, Berg Bites delivers long term energy with complex carbohydrates from heart healthy oats, pea protein isolate, essential fatty acids from nuts, chia seeds and coconut oil, and prebiotic fiber for gut health.* Just grab and go, it’s the right choice every time.",
          21.99,
          7,
          [categories[3]],
          31.74,
          callback
        );
      },
      (callback) => {
        itemCreate(
          "Monster Preworkout",
          "Feel like a beast with this preworkout",
          11.99,
          8,
          [categories[3], categories[4]],
          19.99,
          callback
        );
      },
    ],
    cb
  );
}

async.series([createCategories, createItems], (err, results) => {
  if (err) {
    console.log("FINAL ERR: " + err);
  } else {
    console.log("Items: " + items);
  }
  mongoose.connection.close();
});
