
const balancetext = document.querySelector("#Balance");
const add_balance_btn = document.querySelector("#Add_Balance");
const select_expense_btn = document.querySelector("#Select_Expense");
const submit_btn_plus = document.querySelector("#Submit_Plus");
const expense_bar = document.querySelector("#Expense_Bar");
const submit_btn_minus = document.querySelector("#Submit_Minus");
const switch_interval_btn = document.querySelector("#Switch_Interval_Btn");
const plus_btn = document.querySelector("#Plus_Button");
const minus_btn = document.querySelector("#Minus_Button");
const switch_interval_div = document.querySelector("#Switch_Interval_Div");
const Add_Money = document.querySelector("#Add_Money");
const Back_Btn = document.querySelector("#Back_Btn");
const Not_Valid_Input_Amount = document.querySelector("#Not_Valid_Input_Amount");
const Not_Valid_Input_Type = document.querySelector("#Not_Valid_Input_Type");
const Not_Enough_Balance = document.querySelector("#Not_Enough_Balance");
const selection_box = document.getElementById("selection_box");
const options = selection_box.getElementsByTagName('option');
const Savings_Image = document.querySelector("#Savings_Image");
const No_recent_Expenses_Text = document.querySelector("#No_recent_Expenses_Text");



const Display_Bar_Container = document.querySelector("#Display_Bar_Container");

let amount = document.getElementById("Amount");

let balance = 0;

let Stack_contor = 0;


class Expense_Node{
    constructor(type, amount, date) {
        this.type = type;
        this.amount = amount;
        this.date = date;
        this.next = null;
    }
}

class Expense_Stack{
    constructor() {
        this.top = null;
        this.size = 0;
    }

    push(type, amount, date) {
        const newNode = new Expense_Node(type, amount, date);
        newNode.next = this.top;
        this.top = newNode;
        this.size++;
      }
    
    pop() {
        if (this.isEmpty()) {
          return null;
        }
        const poppedNode = this.top;
        this.top = poppedNode.next;
        this.size--;
        return poppedNode.data;
    }

    isEmpty() {
        return this.size === 0;
    }

    getSize() {
        return this.size;
    }

    peek_type() {
        return; 
    }
    

}

let Expenses_Stack = new Expense_Stack();
let Expenses_Display_Array = [];
let newtop = new Expense_Node();

amount.style.display = "none";
submit_btn_plus.style.display = "none";
expense_bar.style.display = "none";
submit_btn_minus.style.display = "none";



add_balance_btn.addEventListener("click",Show_Add_Menu);
select_expense_btn.addEventListener("click",Show_Subtract_Menu);
submit_btn_plus.addEventListener("click",Add_Balance);
submit_btn_minus.addEventListener("click",Substract_Balance);
switch_interval_btn.addEventListener("click",Swap_Interval);
switch_interval_btn.addEventListener("mouseenter",Blue_Background_Switch);
switch_interval_btn.addEventListener("mouseleave",Grey_Background_Switch);
Back_Btn.addEventListener("click",Starting_Page);

add_balance_btn.addEventListener("mouseenter",Green_Background_Plus);
add_balance_btn.addEventListener("mouseleave",Grey_Background_Plus);

select_expense_btn.addEventListener("mouseenter",Green_Background_Minus);
select_expense_btn.addEventListener("mouseleave",Grey_Background_Minus);

function Blue_Background_Switch() {
    switch_interval_btn.style.backgroundColor = "skyblue";
}

function Grey_Background_Switch() {
    switch_interval_btn.style.backgroundColor = "lightgrey";
}

function Green_Background_Minus() {
    select_expense_btn.style.backgroundColor = "greenyellow";
}

function Grey_Background_Minus() {
    select_expense_btn.style.backgroundColor = "lightgrey";
}

function Green_Background_Plus() {
    add_balance_btn.style.backgroundColor = "greenyellow";
}

function Grey_Background_Plus() {
    add_balance_btn.style.backgroundColor = "lightgrey";
}

let Update_Interval = 60*60*24*7;

function Show_Add_Menu(){
    Clear_Page();
    balancetext.style.display = "block";
    Back_Btn.style.display = "block";
    Add_Money.style.display = "block";
    amount.style.display = "block";
    submit_btn_plus.style.display = "block";
    Not_Valid_Input_Amount.style.display = "none";
}

function Add_Balance(){
    if(amount.value == "") {
        Not_Valid_Input_Amount.style.display = "block";
    }
    else {
        balance += Number(amount.value);
        balancetext.textContent = balance + " €";     
        console.log(balance);
        amount.value = "";
        Starting_Page();
    }
    
}

function Show_Subtract_Menu(){
    Clear_Page();
    balancetext.style.display = "block";
    Back_Btn.style.display = "block";
    Add_Money.style.display = "block";
    amount.style.display = "block";
    submit_btn_minus.style.display = "block";
    expense_bar.style.display = "flex";
    expense_bar.style.justifyContent = "center";
    expense_bar.style.allignElements = "center";
    submit_btn_plus.style.display = "none";
    Not_Valid_Input_Amount.style.display = "none";
    
}

function Substract_Balance(){
    let ok = 1;
    if(amount.value == "") {
        Not_Valid_Input_Amount.style.display = "block";
        ok = 0;
    }

    else {
        Not_Valid_Input_Amount.style.display = "none";
    }

    if(expense_bar.value == "") {
        Not_Valid_Input_Type.style.display = "block";
        ok = 0;
    }
    else {
        Not_Valid_Input_Type.style.display = "none";
    }

    if(Number(amount.value) > balance) {
        Not_Enough_Balance.style.display = "block";
        ok = 0;
    }
    else {
        Not_Enough_Balance.style.display = "none";
    }
    
    if(ok == 1) {
        console.log(expense_bar.value);
        if(balance - Number(amount.value) >= 0){
            balance -= Number(amount.value);
        }
        else{
            balance = 0;
        }
        balancetext.textContent = balance + " €";
        const date = new Date();
        Expenses_Stack.push(expense_bar.value, amount.value, date);
        
        Display_Expense_Stack();
        //Update_Expense_Chart(expense_bar.value, amount.value, date);
        Select_Weekly_Labels();
        amount.value = "";
        expense_bar.value = "";
        Starting_Page();
        Not_Valid_Input_Type.style.display = "none";
    }

}

function Format_Date(currentDate){
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // January is 0, so we add 1 to get the correct month
    const year = currentDate.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return formattedDate;
}

function Create_Display_Bar() {
    let newBar = document.createElement("div");
    newBar.type = document.createElement("div");
    newBar.amount = document.createElement("div");
    newBar.date = document.createElement("div");
    newBar.appendChild(newBar.type);
    newBar.appendChild(newBar.amount);
    newBar.appendChild(newBar.date);
    return newBar;
}

function Customize_Expense_Bar(newBar, type, amount, date) {
    newBar.type.textContent = type;
    newBar.type.style.fontSize = "30px";
    newBar.type.style.marginLeft = "15px";

    newBar.amount.textContent = amount;
    newBar.amount.style.fontSize = "30px";

    newBar.date.textContent = date;
    newBar.date.style.fontSize = "30px";
    newBar.date.style.marginRight = "15px";

    newBar.style.backgroundColor = '#fffcfc';
    newBar.style.display = "flex";
    newBar.style.justifyContent = "space-between";
    newBar.style.alignItems = "center";
    newBar.style.height = "45px";
    newBar.style.width = "500px";
    newBar.style.borderRadius = "20px";
    newBar.style.margin = "5px";
    newBar.style.marginLeft = "auto"; // Center horizontally
    newBar.style.marginRight = "auto"; // Center horizontally
}

function Display_Expense_Stack(){
    let i;

    for(i = 0; i < Expenses_Display_Array.length; i++) {
        Display_Bar_Container.removeChild(Expenses_Display_Array[i]);
    }

    
    newtop = Expenses_Stack.top;
    i=0;
    while(newtop != null && i < 5) {
        Expenses_Display_Array[i] = Create_Display_Bar();
        let formattedDate;
        formattedDate = Format_Date(newtop.date);
        Customize_Expense_Bar(Expenses_Display_Array[i], newtop.type, newtop.amount, formattedDate);
        newtop = newtop.next;
        Display_Bar_Container.appendChild(Expenses_Display_Array[i]);
        i++;
    }
}

class Expense_Labels_Class {
    constructor() {
        this.labels = [];
        this.itemData = [];
        this.dates = [];
    }
}

let Expense_Labels = new Expense_Labels_Class();

let data = {
    labels: Expense_Labels.labels,
    datasets: [{
        data: Expense_Labels.itemData,
        backgroundColor: []
    }]
};

const confix_expenses = {
    type: 'bar',
    width: "500px",
    height: "350px",
    data: data,
    options: {
        responsive: true, // The chart will resize based on its container
        plugins: {
          title: {
            display: true,
            text: "Weekly Expenses",
            color: "white",
          },
          legend: {
            display: false
          },
          tooltip: {
            titleColor: 'white',
            bodyColor: 'white' // Set the tooltip title text color here
          },
        },
        
    },
};

const chartboard = document.getElementById("Chart_Board");

const chart = new Chart( 
    document.getElementById("Expenses_Chart"),
    confix_expenses
);

function getRandomColor() {
    // Generate a random color in hexadecimal format
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function Clear_Labels() {
    Expense_Labels.labels = [];
    Expense_Labels.itemData = [];
    Expense_Labels.dates = [];

    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[0].backgroundColor = [];

    chart.update();
}

function Clear_Page() {
    chartboard.style.display = "none";
    balancetext.style.display = "none";
    plus_btn.style.display = "none";
    minus_btn.style.display = "none";
    switch_interval_div.style.display = "none";
    Add_Money.style.display = "none";
    Back_Btn.style.display = "none";
    amount.style.display = "none";
    expense_bar.style.display = "none";
    submit_btn_minus.style.display = "none";
    submit_btn_plus.style.display = "none";
    Display_Bar_Container.style.display = "none";
    Not_Enough_Balance.style.display = "none";
    Not_Valid_Input_Amount.style.display = "none";
    Not_Valid_Input_Type.style.display = "none";
    Savings_Image.style.display = "none";
    No_recent_Expenses_Text.style.display = "none";
}

function Starting_Page() {
    Clear_Page();
    console.log(Expense_Labels.labels.length);
    Select_Weekly_Labels();
    balancetext.style.display = "block";
    plus_btn.style.display = "inline-block";
    minus_btn.style.display = "inline-block";
    switch_interval_div.style.display = "flex";
    Display_Bar_Container.style.display = "block";
}

function Select_Weekly_Labels() {

    Clear_Labels();
    let ok;
    let newtop = Expenses_Stack.top;
    let date_difference;
    const now_date = new Date();
    while(newtop != null) {
        date_difference = now_date - newtop.date;
        if( date_difference <= Set_Interval_Seconds(Update_Interval) ) {
            ok = 0;
            for(i = 0; i < Expense_Labels.labels.length; i++) {       
                if( newtop.type === Expense_Labels.labels[i] ) {
                    Expense_Labels.itemData[i] += Number(newtop.amount);
                    ok = 1;
                    break;
                }
            }
            if( ok == 0) {
                Expense_Labels.labels.push(newtop.type);
                Expense_Labels.itemData.push(Number(newtop.amount));
                data.datasets[0].backgroundColor.push(getRandomColor());
            }

        }
        newtop = newtop.next;
    }
    chart.data.labels = Expense_Labels.labels;
    chart.data.datasets[0].data = Expense_Labels.itemData;
    
    if(Expense_Labels.labels.length >= 1) {
        chartboard.style.display = "flex";
        Savings_Image.style.display = "none";
        No_recent_Expenses_Text.style.display = "none";
    }
    chart.update();

    if(Expense_Labels.labels.length == 0) {
        chartboard.style.display = "none";
        Savings_Image.style.display = "flex";
        No_recent_Expenses_Text.style.display = "flex";
    }
}

function Set_Interval_Seconds(seconds) {
    return (seconds*1000);
}

function Swap_Interval() {
    if(Update_Interval == 60*60*24*7) {
        Update_Interval = 60*60*24*30;
        switch_interval_btn.textContent = "Weekly";
        confix_expenses.options.plugins.title.text = "Monthly Expeneses";
        Chart_Text = "Monthly Expenses";
        Select_Weekly_Labels();
    }
    else {
        Update_Interval = 60*60*24*7;
        switch_interval_btn.textContent = "Monthly";
        confix_expenses.options.plugins.title.text = "Weekly Expeneses";
        Chart_Text = "Weekly Expenses";
        Select_Weekly_Labels();
    }
}

Clear_Page();
Starting_Page();
