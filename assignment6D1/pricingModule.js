function setPrice(item_id, products, sales_record, discount, dynamic) {
  const now = new Date();
  const discountRates = {
    24: 10,
    48: 30,
    72: 60,
    96: 95,
  };


  for (let category in products) {
    products[category].forEach((product) => {
      if (item_id === '*' || product.id === item_id) {
        if (dynamic) {
          if (!Array.isArray(sales_record)) {
            console.error("Error: salesRecord should be an array");
            return;
          }
          const sales = sales_record.filter((record) => record.item_id === product.id);
          const recentSale = sales.reduce((recent, record) => {
            const recordDate = new Date(record.date);
            return recordDate > recent ? recordDate : recent;
          }, new Date(0));  // 0 sets the date to the earliest date possible
          
          const hoursSinceSale = (now - recentSale) / (60 * 60 * 1000);
          let dynamicDiscount = 0;
          
          for (let hours in discountRates) {
            if (hoursSinceSale >= hours) {
              dynamicDiscount = discountRates[hours];
            }
          }
          product.price = product.price * (1 - dynamicDiscount / 100);
        } else {
          product.price = product.price * (1 - discount / 100);
        }
      }
    });
  }
}


module.exports = {
  setPrice,
};

