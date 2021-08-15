class Food {
    constructor (category, name, price, calories ) {
        this.category = category;     
        this.name = name;
        this.price = price;
        this.calories = calories;       
    }
    
}

class Snack extends Food {
    constructor(name, price, calories) {
        super(catStorage.getCat('snacks'), name, price, calories);
    }
}

class Beverage extends Food {
    constructor(name, price, calories) {
        super(catStorage.getCat('beverages'), name, price, calories);
    }
}


class Burger extends Food {
    constructor({name, size ='small', stuffing}) {      
        super(catStorage.getCat('basic menu'));
        this.SIZE_LARGE = {price: 100, calories: 40, isChosen: size === 'large'          ? true: false};
        this.SIZE_SMALL = {price: 50,  calories: 20, isChosen: size === 'small' || !size ? true: false};        
        this.STUFFING_CHEESE = {name:'cheese', sortPriority: 1, isChosen: stuffing === 'cheese' || !stuffing ? true : false, calories: 20, price: 10};
        this.STUFFING_SALAD  = {name:'salad',  sortPriority: 2, isChosen: stuffing === 'salad'               ? true : false, calories: 5,  price: 20};
        this.STUFFING_POTATO = {name:'potato', sortPriority: 3, isChosen: stuffing === 'potato'              ? true : false, calories: 10, price: 15};       
        this.price    = Burger.#calculatePriceAndCalories(this, 'price');
        this.calories = Burger.#calculatePriceAndCalories(this, 'calories');
        this.name = Burger.#productInfo(this);
    }

    static #calculatePriceAndCalories(burger, criteria) {
        let value = 0;
        for(const prop in burger) {
            if(typeof burger[prop] === 'object' && 'isChosen' in burger[prop]) { value = burger[prop].isChosen ? (value + burger[prop][criteria]) : value; }
        }
        return value;
    }
    static getChosenStuffing(burger) {
        let stuffing;
        for (const prop in burger) {
            if (prop.startsWith('STUFFING')) {
                stuffing = burger[prop].isChosen ? burger[prop] : stuffing;
            }
        }
        return stuffing;
    }
  
     static #productInfo(burger) {
        let size = burger.SIZE_LARGE.isChosen ? 'large' : 'small';
        let stuffing = Burger.getChosenStuffing(burger).name;              
        return `${size} hamburger with ${stuffing}`;
    }
}

class Order {
    constructor(Id) {
        this.Id = Id;
        this.productList = [];
        this.isPaid = false;
    }
    getOrderInfo() {
        let  itemsLen = 5, priceLen = 5, caloriesLen = 8;
        itemsLen = itemsLen - String(this.productList.length).length;
        priceLen = priceLen - String(this.#calculateTotal('price')).length;
        caloriesLen = caloriesLen - String(this.#calculateTotal('calories')).length;
        return `${this.Id}\t${this.productList.length}${' '.repeat(itemsLen)}\t${this.#calculateTotal('price')}${' '.repeat(priceLen)}\t${this.#calculateTotal('calories')}${' '.repeat(caloriesLen)}\t${this.isPaid ? 'YES': 'NO'}`;
    }

    addProduct(prod) {
        let product = foodFactory(prod);
        if (product) {
            console.log(product.name,' succesfully added');
            this.productList.push(product);
        } else {
            console.log('No such product in menu or wrong stuffing/size. Check your input');
        }
    }

    removeProduct(itemId ) {
        if (--itemId < this.productList.length) {
            if (!this.productList[itemId]) {
                console.log('No id corresponding items found');
                return false;
            }
            console.log(`${this.productList[itemId].name} succesfully deleted`);
            this.productList.splice(itemId, 1);
        }
    }

    payOrder() {
        if(this.productList.length === 0) {
            console.log('empty order can\'t being paid');
            return false;
        }      
        this.isPaid = true;
        return true;
    }
    
    #calculateTotal(criteria) {
        let total = 0;
        for (const item of this.productList) {
            total += item[criteria];
        }
        return total;
    }

    viewOrder() {
        if (this.productList.length === 0) {
            console.log(`No products been added\nORDER ID  #${this.Id}`);
            return;
        }
        this.sortOrder();
        let orderInfo = `id\t\tname\t\t\t\t\t\tprice\tcalories\n`;
        let index = 0;
        let spaceFiller, maxNameLen = 27, priceLen = 5;
        for (const item of this.productList) {
            if (priceLen === 5 ) {
                priceLen = priceLen - String(item.price).length;
            }
            spaceFiller = item.name.length < maxNameLen ? ' '.repeat(maxNameLen - item.name.length) :'';
            orderInfo += `${index+1}\t\t${item.name}${spaceFiller}\t${item.price}${' '.repeat(priceLen)}\t${item.calories}\n`;
            index++;
        }
        orderInfo += `TOTAL\t\t\t\t\t\t\t\t${this.#calculateTotal('price')}${' '.repeat(priceLen)}\t${this.#calculateTotal('calories')}\n`;
        orderInfo += `ORDER ID  #${this.Id}, PAID: ${this.isPaid ? 'YES': 'NO'}`;
        console.log(orderInfo);
    }

    sortOrder() {
        this.productList.sort(Order.#sortCallback);
    }

    static #sortCallback(a, b) {   
        let [cat1,cat2] = [a.category.sortPriority, b.category.sortPriority];
        if (cat1 !== cat2) {
            return cat1 > cat2 ? 1 : -1;
        }
        if (!a.name.includes('hamburger')) {
            if(a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1: -1;
        }
        
        let [stuff1, stuff2] = [Burger.getChosenStuffing(a).sortPriority, Burger.getChosenStuffing(b).sortPriority]; 
        if (stuff1 !== stuff2) {           
            return a.name > b.name ? 1: -1;
        }

        if(a.name === b.name) {
            return 0;
        }
        return a.name > b.name ? 1: -1;
    }
}

let catStorage = (()=>{
    let catList = ['basic menu', 'beverages', 'snacks', 'stuffings'].map((cat, index)=> { return {name: cat, sortPriority: index + 1}});
    return {
        getCat(name) { 
            return catList.find( cat => cat.name === name);
        }
    }
})();

let argObjectsFactory = (el)=> {   
    let obj = {name: null, price: null, calories: null};
    let index = 0;
    for (const prop in obj) {
        obj[prop] = el[index++];
    }
    return obj;
}

let argFactory = (() => { 
    let productList =  [['olivier', 100, 80], ['caesar', 100, 20], ['cola', 50, 40], ['coffee', 80, 20]].map( el => argObjectsFactory(el));
    return {
        getArgs(arg) {
            let params = [];
            let prod = productList.find( prod => prod.name === arg);
            for (const prop in prod) {
                params.push(prod[prop]);
            }
            return params;
        }
    }
})()

let foodFactory = (prod) => {
    let aliases = [{name: ['hamburger'], construct: Burger}, {name:['coffee','cola'], construct: Beverage }, {name: ['caesar', 'olivier'], construct: Snack}];
    let classToConstruct = aliases.find( el => {
        if (el.name.includes(prod.name)) {
            return el;
        }
    })

    if (!classToConstruct) {
        return false;
    }
    classToConstruct = classToConstruct.construct;   
    
    if(classToConstruct === Burger) {
        if (prod.size && !(prod.size === 'large' || prod.size === 'small')) {
            return false;
        }
        if(prod.stuffing && !(prod.stuffing === 'salad' || prod.stuffing === 'potato' || prod.stuffing === 'cheese')) {
            return false;
        }
    }
    
    return classToConstruct === Burger ? new classToConstruct(prod) : new classToConstruct(...argFactory.getArgs(prod.name));
 }

 /* orders README. [?] means optional parameter. valid product names are [cola, coffee, olivier, caesar, hamburger], stuffing [potato, salad, cheese], size [small, large]
 newOrder(?object: {name, ?size, ?stuffing}): creates Order instance, pushes it to orderList[] and sets it as an active order; Can accept same parameters as addProduct;
 setActiveOrder( number: id): sets existing order from orderList[] as this.#activeOrder
 viewActiveOrder(): shows information about active order
 payOrder(): marks  active order as paid
 addProduct(object: {name, ?size, ?stuffing}). adds product to active order's product list; name parameter is mandatory
 removeProduct(number: id). removes product from active order's product list. id is order position in product list. Can be found via viewActiveOrder;
 getOrdersList(). displays orders summary
 */

class OrdersList {
    #activeOrder;
    #orderId;
    #orderList;
    constructor() {
    this.#activeOrder;
    this.#orderId = 0;
    this.#orderList = [];
    }

    #checkId = (id) => {
        if (!id || !(this.#orderList.find( order => order.Id === id))) {
            console.log('Please provide correct order ID. Order ID might be found via getOrderList()');
            return false;
        }
        return true;
    }

    #checkOrder = function (edit = true) {
        if (!this.#activeOrder) {
            console.log('Create order first!');
            return false;
        }
        if (this.#activeOrder.isPaid && edit) {
            console.log('Unable to edit paid order');
            return false;
        }
        return true;
    }
    newOrder = function(product) {
        this.#activeOrder = new Order(++this.#orderId); 
        this.#orderList.push(this.#activeOrder);
        if (product) {
            this.#activeOrder.addProduct(product);
        }        
    }

    setActiveOrder = function (id) {
        if (this.#orderList.length === 0 ) {
            console.log('No orders present. Add an order first');
            return;
        }        

        if (id === this.#activeOrder.Id) {
            console.log(`Order ${id} is already an active order`);
            return;
        }
         
        if (!this.#checkId(id)) {
            return;
        }        
        this.#activeOrder = this.#orderList.find( order => order.Id === id);
    }
    
    addProduct = function(prod) {
        if (!this.#checkOrder()) {
            return;
        }

        if (!prod) {
            console.log('please, provide at least correct product name');
            return;
        }

        this.#activeOrder.addProduct(prod);
    }
    viewActiveOrder = () => {
        let isEdit = false;
        if (!this.#checkOrder(isEdit)) {
            return;
        }

        this.#activeOrder.viewOrder();
    }

    viewOrder = (id) =>{
        console.log('orderId is ' + id);
        if (!this.#checkId(id)) {
            return;
        }
        this.#orderList.find(order => order.Id === id).viewOrder();
    }

    removeProduct = (id) =>{
        if (!this.#checkOrder()) {
            return false;
        } 
        this.#activeOrder.removeProduct(id);
    }
    getOrdersList = () => {
        if(this.#orderList.length === 0) {
            console.log('No orders were made');
            return;
        }
        let infoString = 'ID\tITEMS\tPRICE\tCALORIES\tPAID\n'
        for(const order of this.#orderList) {
            infoString+=`${order.getOrderInfo()}\n`;
        }
        console.log(infoString);
    }
    payOrder = (id = this.#activeOrder?.Id) => {
        if (!this.#checkOrder() || !this.#checkId(id)) {
            return;
        }

        let order = this.#orderList.find(order => order.Id === id);
        if (order.payOrder()) {
            console.log(`Order #${order.Id} succesfully paid`);
        }
    }
}