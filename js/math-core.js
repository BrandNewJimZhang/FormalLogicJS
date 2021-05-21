//
// FormalLogicJS (a.k.a. MathematicalLogicJS, MathLogicJS)
//
// Copyright 2021 (c) Jim Zhang
// 
// Jim Zhang @ Github: https://github.com/BrandNewJimZhang
// Jim Zhang's blog: http://jimzhang.me
//
// This project is based on JQuery 3.6.0.
//

"use strict";

$(function() {
    $(this).bind("contextmenu", function(e) { // Disable right click.
        e.preventDefault();
    });

    function makeSVG(tag, attrs) { // svg + jQuery 有自身特性
        var element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (var k in attrs) element.setAttribute(k, attrs[k]);
        return element;
    }

    function draggable(selector) {
        var selectedElement = null;
        var currentX = 0;
        var currentY = 0;

        $(selector).mousedown(function (e) {
            // save the original values
            currentX = e.clientX;
            currentY = e.clientY;
            selectedElement = e.target;
        }).mousemove(function (e) {    
            // if there is an active element, move it around            
            if (selectedElement) {
                var dx = parseInt(selectedElement.getAttribute("x")) + e.clientX - currentX;
                var dy = parseInt(selectedElement.getAttribute("y")) + e.clientY - currentY;
                currentX = e.clientX;
                currentY = e.clientY;
                selectedElement.setAttribute("x", dx);
                selectedElement.setAttribute("y", dy);
            }
        }).mouseup(function (e) {
            // deactivate element after setting it into its new location
            selectedElement = null;  
        });
    };

    function truth_table(input) { // 真值表生成函数
        var value = new Array(50).fill(0);
        var flag = 1;
        var table = "<table class=\"tg\"><thead><tr>";
        // var table = $("<table></table>")
        var box, input, len_val = 0, len_input = 0;
        var operator = ["∧", "∨", "(", ")", "~", "→", "↔"];

        function is_alpha(char) { // 判断字符是否是字母 p，q，r 等
            return operator.includes(char)? false : true;
        }

        var ans = new Array(50).fill(0); // 储存每一个排列

        function rang(num) { // 递归函数，生成 FFFF 到 TTTT 的排列
            if (num>=len_val) { // 递归最底层，已经生成了 TF 全排列在数组 ans 中
                table+="<tr>"
                for (var i=0; i<len_val; i++) {
                    table+="<td>";
                    if (ans[i]==1) {
                        table+="T";
                    }
                    else {
                        table+="F";
                    }
                    table+="</td>";
                }
                table+="<td>";
                if(R()==true){ // 在当前排列调用函数R，计算当前排列的真值
                    table+="T";
                }
                else{
                    table+="F";
                }
                table+="</td></tr>"
                return ;
            }
            ans[num]=0;
            rang(num+1);
            ans[num]=1;
            rang(num+1); // 递归步骤
            return;
        }

        //
        var cal = new Array(200).fill(0); // 逻辑栈，储存运算符号
        var num = new Array(200).fill(0); // 字母栈，储存字母
        var top_num, top_cal; // 两个栈的栈顶位置

        function in_var(ch){ // 判断字符ch是否在字母表中，跟上面的in_value函数重复了
            for (let i=0;i<len_val;i++) {
                if(value[i]==ch) return true;
            }
            return false;
        }
        function find_var(ch){ // 计算真值的时候，找到字母ch对应的取值
            /*
                例如value[]={p,q,r}
                ans[]={1,0,1}
                输入ch="q"
                返回"0"
                输入ch="r"
                返回"1"
            */
            for (let i=0;i<len_val;i++) {
                if(value[i]==ch){
                    if(ans[i]==1){
                        return "1";
                    }
                    else{
                        return "0";
                    }
                }
            }
        }

        function calculate(){ // 取运算栈的栈顶运算符进行运算
            if(cal[top_cal]=="~"){
                if(num[top_num]=="1"){
                    num[top_num]="0";
                }
                else{
                    num[top_num]="1";
                }
            }
            else if(cal[top_cal]=="∧"){
                let ch1=num[top_num];
                let ch2=num[top_num-1];
                top_num--;
                if(ch1=="1"&&ch2=="1") num[top_num]="1";
                else num[top_num]="0";
            }
            else if(cal[top_cal]=="∨"){
                let ch1=num[top_num];
                let ch2=num[top_num-1];
                top_num--;
                if(ch1=="0"&&ch2=="0")num[top_num]="0";
                else num[top_num]="1";
            }
            else if(cal[top_cal]=="→"){
                let ch1=num[top_num];
                let ch2=num[top_num-1];
                top_num--;
                if(ch1=="0"&&ch2=="1")num[top_num]="0";
                else num[top_num]="1";
            }
            else if(cal[top_cal]=="↔"){
                let ch1=num[top_num];
                let ch2=num[top_num-1];
                top_num--;
                if((ch1=="0"&&ch2=="0")||(ch1=="1"&&ch2=="1"))num[top_num]="1";
                else num[top_num]="0";
            }
            top_cal--; // 运算栈栈顶位置-1
        }
        function compare(a, b) { // 比较运算符a和b的优先级，a优于b返回true
            if (b=="(") return true;
            if (a=="~"&&b!="~") return true;
            return false;
        }

        function R() { // 计算真值的函数，即求在当前排列下逻辑表达式的真假
            top_cal = -1; top_num = -1; // 栈和栈顶初始化
            for (let i=0;i<len_input;i++) { // 遍历{"p","&","q"}
                // 如果是字母，入字母栈
                if (in_var(box[i])) num[++top_num] = find_var(box[i]);
                else { // 如果是运算符
                    if (box[i]==")") { // 右括号优先级最低，循环运算，直到运算栈的栈顶是左括号
                        while (cal[top_cal]!="(") {
                            calculate(); // 取运算符栈顶进行运算
                        }top_cal--;
                    }
                    else if(box[i]=="(") { // 左括号入运算栈
                        cal[++top_cal]=box[i];
                    }
                    else if(top_cal==-1 || compare(box[i],cal[top_cal])) { // 如果当前运算符比栈顶运算符优先级高，入栈
                        cal[++top_cal]=box[i];
                    }
                    else {
                        while(!(top_cal==-1 || compare(box[i],cal[top_cal]))){ // 如果不满足就取栈顶元素进行运算
                            calculate();
                        }
                        cal[++top_cal]=box[i];
                    }
                }
            }
            while(top_cal!=-1){
                calculate();
            }
            if(!(top_num==0&&top_cal==-1))flag=0; // flag的设置为了判断非法输入
            if(num[0]=="1")return true; // 01栈最后的栈顶值即为计算的真值
            return false;
        }

        document.getElementById("truth-table").innerHTML=undefined;
        if(input==""){
            document.getElementById("truth-table").innerText="There is no input";
            return;
        }
        box = [...input]; // ["p","&","q"]
        
        len_input = box.length; // 3

        for (var i=0; i<len_input; i++) { // 添加表头
            if (is_alpha(box[i]) && (!value.includes(box[i]))) {
                value[len_val] = box[i];
                len_val++;
                table+="<th class=\"tg-l6li\">"
                table=(table+box[i]);
                table+="</th>"
            }
            
        }
        table+="<th>Result</th>"
        table+="</tr></thead><tbody>" // add body

        rang(0); // 递归，生成排列，计算真值，添加到表中

        if (flag==0) {
            $("#truth-table").text("Invalid input");
        }
        else {
            table+="</table>"
            $("#truth-table").html(table);
        }
    };

    var mubu = makeSVG("svg", {
        id: "mubu",
        version: "1.1",
        height: $(document).height(),
        width: $(document).width(),
    });
    $("div#project").append(mubu);

    // 加点
    mubu = $("svg#mubu");
    var interval = 20;
    for (var i=0; i<=(mubu.attr("width")/interval); i++) {
        for (var j=0; j<=(mubu.attr("height")/interval); j++) {
            var circle = makeSVG("circle", {
                cx: interval*i,
                cy: interval*j,
                r: .75,
                color: "#ddd",
            });
            mubu.append(circle);
        };
    };

    // 用户控制区布局
    var divinput = $("div#input-section");
    var divbutton = $("<div></div>").attr("id", "operator-button");
    
    // 联结词按钮区
    var l_operators = ["∧", "∨", "~", "→", "↔"];
    for (var item in l_operators) {
        var string = "<button></button>";
        divbutton.append(
            $(string).text(l_operators[item]).attr({
                class: "operator",
                id: "operator"+l_operators[item]
            })
        );
    };
    
    // 输入变元
    divinput.append(divbutton, 
        $("<input>").attr({
            id: "input-variable",
            type: "text",
        })
    );

    var l_items = [];
    item = $("<button>Generate</button>").attr({
        id: "generate-button",
    }).click(function split() {
        var input = $("#input-variable")[0].value;
        var box = [...input]; //["p","&","q"]
        var box1 = [];
        var len = box.length;
        for (let i=0; i<len; i++) {
            if(box[i]!=" ") box1.push(box[i])
        }
        
        var mubu = $("svg#mubu");
        for (var item in box1) {
            var text = $(makeSVG("text", {
                x: 15,
                y: 40*item + 30,
                fill: "transparent",
            })).text(box1[item]);
            mubu.append(text);
            mubu.append($(makeSVG("rect", {
                x: 10,
                y: 40*item + 10,
                width: text.get(0).getBBox().width+10,
                height: 30,
                stroke: "#aaa",
                fill: "#fff",
                rx: 5,
                ry: 5,
                text: box1[item],
            })));
            var text = $(makeSVG("text", {
                x: 15,
                y: 40*item + 30,
                fill: "#000",
            })).text(box1[item]);
            mubu.append(text);
            
        }
    });
    divinput.append(item);

    mubu.click(function (e) {
        if (e.target.tagName !== "rect") {
            $("rect").attr("stroke", "#aaa");
            l_items = [];
        }     
        else {
            if ($(e.target).attr("stroke") == "red") {
                $(e.target).attr("stroke", "#aaa");
            }
            else {
                $(e.target).attr("stroke", "red");
                l_items.push([e.target, $(e.target).attr("text")])
            }
        }
    });

    $(".operator").click(function (e) {
        if (l_items.length == 1 && e.target.id == "operator~") {
            var temp = l_items.pop()
            l_items.push("(~"+temp[1]+")")
            var line = makeSVG("line", {
                x1: parseInt($(temp[0]).attr("x"))+parseInt($(temp[0]).attr("width")),
                x2: parseInt($(temp[0]).attr("x"))+parseInt($(temp[0]).attr("width"))+100,
                y1: parseInt($(temp[0]).attr("y"))+parseInt($(temp[0]).attr("height")/2),
                y2: parseInt($(temp[0]).attr("y"))+parseInt($(temp[0]).attr("height")/2),
                stroke: "#000"
            })
            var raw_text = "(~"+temp[1]+")";
            var text = $(makeSVG("text", {
                x: 15,
                y: 40*item + 30,
                fill: "transparent",
            })).text(raw_text);
            mubu.append(text);
            mubu.append($(makeSVG("rect", {
                x: parseInt($(temp[0]).attr("x"))+parseInt($(temp[0]).attr("width"))+100,
                y: parseInt($(temp[0]).attr("y")),
                width: text.get(0).getBBox().width+10,
                height: 30,
                stroke: "#aaa",
                fill: "#fff",
                rx: 5,
                ry: 5,
                text: raw_text,
            })));
            var text = $(makeSVG("text", {
                x: parseInt($(temp[0]).attr("x"))+parseInt($(temp[0]).attr("width"))+105,
                y: parseInt($(temp[0]).attr("y")) + 20,
                fill: "#000",
            })).text(raw_text);
            console.log(raw_text)
            mubu.append(text);
            mubu.append(line);
            mubu.append(rectbox);
        }
        else if (l_items.length == 2 && e.target.id != "operator~") {
            var second = l_items.pop();
            var first = l_items.pop();
            var raw_text = "("+first[1]+e.target.id.charAt(e.target.id.length-1)+second[1]+")";
            l_items.push(raw_text);
            var line1 = makeSVG("line", {
                x1: parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width")),
                x2: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40),
                y1: parseInt($(first[0]).attr("y"))+parseInt($(first[0]).attr("height")/2),
                y2: parseInt($(first[0]).attr("y"))+parseInt($(first[0]).attr("height")/2),
                stroke: "#000"
            });
            var line2 = makeSVG("line", {
                x1: parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width")),
                x2: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40),
                y1: parseInt($(second[0]).attr("y"))+parseInt($(second[0]).attr("height")/2),
                y2: parseInt($(second[0]).attr("y"))+parseInt($(second[0]).attr("height")/2),
                stroke: "#000"
            })
            var line_together_h = makeSVG("line", {
                x1: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40),
                x2: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40)+60,
                y1: ((parseInt($(first[0]).attr("y"))+parseInt($(first[0]).attr("height")/2))+(parseInt($(second[0]).attr("y"))+parseInt($(second[0]).attr("height")/2)))/2,
                y2: ((parseInt($(first[0]).attr("y"))+parseInt($(first[0]).attr("height")/2))+(parseInt($(second[0]).attr("y"))+parseInt($(second[0]).attr("height")/2)))/2,
                stroke: "#000"
            })
            var line_together_v = makeSVG("line", {
                x1: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40),
                x2: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40),
                y1: parseInt($(first[0]).attr("y"))+parseInt($(first[0]).attr("height")/2),
                y2: parseInt($(second[0]).attr("y"))+parseInt($(second[0]).attr("height")/2),
                stroke: "#000"
            });
            
            var text = $(makeSVG("text", {
                x: 15,
                y: 40*item + 30,
                fill: "transparent",
            })).text(raw_text);

            mubu.append(text);

            var rectbox = $(makeSVG("rect", {
                x: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40)+60,
                y: ((parseInt($(first[0]).attr("y"))+parseInt($(second[0]).attr("y"))))/2,
                width: text.get(0).getBBox().width+10,
                height: 30,
                stroke: "#aaa",
                fill: "#fff",
                rx: 5,
                ry: 5,
                text: raw_text,
            }));

            var text = $(makeSVG("text", {
                x: Math.max(
                    parseInt($(first[0]).attr("x"))+parseInt($(first[0]).attr("width"))+40,
                    parseInt($(second[0]).attr("x"))+parseInt($(second[0]).attr("width"))+40)+65,
                y: ((parseInt($(first[0]).attr("y"))+parseInt($(second[0]).attr("y"))))/2 + 20,
                fill: "#000",
            })).text(raw_text);
            mubu.append(rectbox, text, line1, line2, line_together_h, line_together_v);
            $("#hidden-container").text(raw_text);
        };
    });

    item = $("<button>Generate truth table</button>").attr({
        id: "truth-table-button",
    }).click(function () {
        var text = $("#hidden-container").text();
        truth_table(text);
        $("div#truth-table").fadeIn(800);
    });
    
    divinput.append(item);

    draggable("table.tg");
});

