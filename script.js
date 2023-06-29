'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-25T14:11:59.604Z',
    '2023-05-29T17:01:17.194Z',
    '2023-05-30T23:36:17.929Z',
    '2023-05-31T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class='movements__date'>${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    //In each call, print the remaining time to UI
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}: ${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login back to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  //Set the timer to minutes
  let time = 300;

  tick();
  //Call the timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//Fake Always Login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Experiment API

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric', //'2-digit'
      month: 'numeric', // long
      year: 'numeric',
      // weekday: 'long', // short, narrow
    };

    // const local = navigator.language; // this is used to take language of the users from its browser
    // console.log(local);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) {
      console.log(typeof timer);
      clearInterval(timer);
    }
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
console.log(23 === 23.0); // true
console.log(0.1 + 0.2 === 0.3); //false

//Conversion
console.log(Number('23'));
console.log(+'23'); // 23

//Parsing
console.log(Number.parseInt('30px', 10)); // 30, Here Number is method and as we already aware of functions are also objects thats why it has parseInt method which accept 2 args string and radix = (means base of number system )
console.log(Number.parseInt('e23', 10)); // NaN, string must start with digit otherwise it will not work

console.log(Number.parseInt('  2.5rem ', 10)); // 2, we can call this parseInt without Number method but its not recommended b/c Number method provide namespace
console.log(Number.parseFloat(' 2.5 rem ', 10)); // 2.5

console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); //false
console.log(Number.isNaN(+'20X')); //true
console.log(Number.isNaN(23 / 0)); //false

//Check if value is NaN
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false

// Use isFinite method instead of isNaN method

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23 / 0)); // false

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); // 5
console.log('cube root : ', 8 ** (1 / 3)); // 2 it is cube root

console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23 b/c it does coercion
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN
console.log(Math.min(5, 18, 23, 11, 2)); //2
console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.trunc(Math.random() * 6) + 1);
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(3, 3));

// Rounding integers
console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); //24

console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); //24

console.log(Math.floor(23.3)); // 23
console.log(Math.floor('23.9')); //23

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // 24

// Rounding decimals

console.log((2.7).toFixed(0)); // '3'
console.log((2.7).toFixed(3)); // '2.700'
console.log((2.345).toFixed(2)); //'2.35'
console.log(+(2.345).toFixed(2)); //2.35;

// Even or odd

const isEven = n => n % 2 === 0;

console.log(isEven(4));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orangered';
    }
  });
});

*/

/*

const diameter = 284_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.1415; // invalids 3._1415, _3.1415, 3_.1415, 3.1415_

console.log(2 ** 53 - 1); //9007199254740991 number can store value till 2**53 and total bits are 64 bits but others are used to store decimal numbers
console.log(Number.MAX_SAFE_INTEGER); //9007199254740991
console.log(2 ** 53 + 1); //9007199254740992
console.log(2 ** 53 + 2); //9007199254740994
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);
console.log(30349730947390490327092374093497n); // n used for BigInt

console.log(BigInt(32232432));

// Operations
console.log(10000n + 10000n);
console.log(343243232322332432432432324323n * 100000n);
console.log(Math.sqrt(16n)); // error

const huge = 232343432432434324324324324n;
const num = 23;
console.log(huge * BigInt(num));

// Exceptions
console.log(20n > 15); // true
console.log(20n === 20); // false
console.log(typeof 20n); // bigint
console.log(20n == '20'); // true
console.log(huge + ' is REALLY big!!!'); // this number will be converted to string

//Divisions
console.log(11n / 3n); //3n0
console.log(10 / 3); // 3.3333

*/

//Create date

/*
const now = new Date(); //Wed May 31 2023 09:39:33 GMT+0530 (India Standard Time)
console.log(now);
console.log(new Date('Aug 02 2020 18:05:41')); //Sun Aug 02 2020 18:05:41 GMT+0530 (India Standard Time)

console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31));
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

*/
// Working with dates

/*
const future = new Date(2037, 10, 19, 15, 23); // here 10 represents month november
console.log(future); //Thu Nov 19 2037 15:23:00 GMT+0530 (India Standard Time)

console.log(future.getFullYear()); // 2037

console.log(future.getMonth()); //10
console.log(future.getDate()); // 19
console.log(future.getDay()); //4 it is the number of week like today is wednesday so it is showing 4
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime()); // it will give output in miliseconds since 1970
console.log(new Date(2142237180000)); //Thu Nov 19 2037 15:23:00 GMT+0530 (India Standard Time)

console.log(Date.now());
future.setFullYear(2040);
console.log(future);

*/

//

/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future); // If you print this without converting to number, it will shows object like "Thu Nov 19 2037 15:23:00 GMT+0530 (India Standard Time)"  but if you convert it into number then it will show output in miliseconds

const calcDaysPassed = (date1, date2) => {
  return Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
};

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14)); // new Date(year,month,day,hours,minutes,second,miliseconds)
console.log(days1);

*/

/*
const num = 38847323.323;
const options = {
  style: 'currency', // percent(for this unit is not required)
  unit: 'celsius', // mile-per-hour
  currency: 'INR',
  // useGrouping: false,
};
console.log('US:    ', new Intl.NumberFormat('en-US', options).format(num));

console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));

console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log('India: ', new Intl.NumberFormat('en-IN', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);

*/

// settimeout function
/*
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  'olives',
  'spinach'
); // we can pass the arguments in settimout function what we wanna pass into the callback function

console.log('Waiting....');
console.log(pizzaTimer);
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);
// above if condition will stop setTimeout function execution if true

// setInterval
setInterval(function () {
  const now = new Date();
  console.log(
    `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getMilliseconds()}`
  );
}, 1000);

*/
