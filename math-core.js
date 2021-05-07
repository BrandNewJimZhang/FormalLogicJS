//
// MathematicalLogicJS (a.k.a. MathLogicJS)
//
// Copyright 2021 (c) Jim Zhang
// 
// Jim Zhang @ Github: https://github.com/BrandNewJimZhang
// Jim Zhang's blog: http://jimzhang.me
//
// This project is based on JQuery 3.x.
//

"use strict";

$(function() {
    function makeSVG(tag, attrs) {
        var element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            element.setAttribute(k, attrs[k]);
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

    var mubu = makeSVG('svg', {
        id: 'mubu',
        version: '1.1',
        height: 400,
        width: 1200,
        viewBox: "0 0 1200 400",
    });
    $('div#project').append(mubu);

    // 加点
    mubu = $('svg#mubu');
    for (var i=0; i<=(mubu.attr('width')/10); i++) {
        for (var j=0; j<=(mubu.attr('height')/10); j++) {
            var circle = makeSVG('circle', {
                cx: 10*i,
                cy: 10*j,
                r: 0.5,
                color: '#ddd',
            });
            mubu.append(circle);
        };
    };

    // 用户控制区布局
    var divinput = $('div#input-section');

    // 联结词按钮区
    var l_operators = ['∧', '∨', '~', '→', '↔']

    for (var item in l_operators) {
        var string = "<button>"+l_operators[item]+"</button>";
        divinput.append(
            $(string).attr({
                class: 'operator',
                id: 'operator'+l_operators[item]
            })
        );
    };
    
    // 输入变元
    divinput.append(
        $("<input>").attr({
            id: 'input-variable',
            type: 'text',
        })
    );

    var l_items = [];
    item = $("<button>Generate</button>").attr({
        id: 'generate-button',
    }).click(function split() {
        var input = $("#input-variable")[0].value;
        var box = [...input]; //['p','&','q']
        var box1 = [];
        var len = box.length;
        for (let i=0; i<len; i++) {
            if(box[i]!=' ') box1.push(box[i])
        }
        
        var mubu = $('svg#mubu');
        for (var item in box1) {
            var text = $(makeSVG('text', {
                x: 15,
                y: 40*item + 30,
                fill: 'transparent',
            })).text(box1[item]);
            mubu.append(text);
            mubu.append($(makeSVG('rect', {
                x: 10,
                y: 40*item + 10,
                width: text.get(0).getBBox().width+10,
                height: 30,
                stroke: '#aaa',
                fill: '#fff',
                rx: 5,
                ry: 5,
                text: box1[item],
            })));
            var text = $(makeSVG('text', {
                x: 15,
                y: 40*item + 30,
                fill: '#000',
            })).text(box1[item]);
            mubu.append(text);
            
        }
    });
    divinput.append(item);

    mubu.click(function (e) {
        if (e.target.tagName !== 'rect') {
            $('rect').attr('stroke', '#aaa');
            l_items = [];
        }     
        else {
            if ($(e.target).attr('stroke') == 'red') {
                $(e.target).attr('stroke', '#aaa');
            }
            else {
                $(e.target).attr('stroke', 'red');
                l_items.push([e.target, $(e.target).attr('text')])
            }
        }
    });

    $('.operator').click(function (e) {
        if (l_items.length == 1 && e.target.id == 'operator~') {
            var temp = l_items.pop()
            l_items.push('(~'+temp[1]+')')
            var line = makeSVG('line', {
                x1: parseInt($(temp[0]).attr('x'))+parseInt($(temp[0]).attr('width')),
                x2: parseInt($(temp[0]).attr('x'))+parseInt($(temp[0]).attr('width'))+100,
                y1: parseInt($(temp[0]).attr('y'))+parseInt($(temp[0]).attr('height')/2),
                y2: parseInt($(temp[0]).attr('y'))+parseInt($(temp[0]).attr('height')/2),
                stroke: '#000'
            })
            var text = $(makeSVG('text', {
                x: 15,
                y: 40*item + 30,
                fill: 'transparent',
            })).text('(~'+temp[1]+')');
            mubu.append(text);
            mubu.append($(makeSVG('rect', {
                x: parseInt($(temp[0]).attr('x'))+parseInt($(temp[0]).attr('width'))+100,
                y: parseInt($(temp[0]).attr('y')),
                width: text.get(0).getBBox().width+10,
                height: 30,
                stroke: '#aaa',
                fill: '#fff',
                rx: 5,
                ry: 5,
                text: '(~'+temp[1]+')',
            })));
            var text = $(makeSVG('text', {
                x: parseInt($(temp[0]).attr('x'))+parseInt($(temp[0]).attr('width'))+105,
                y: parseInt($(temp[0]).attr('y')) + 20,
                fill: '#000',
            })).text('(~'+temp[1]+')');
            mubu.append(text);
            mubu.append(line);
            mubu.append(rectbox);
        }
        else if (l_items.length == 2 && e.target.id != 'operator~') {
            var second = l_items.pop();
            var first = l_items.pop();
            var raw_text = '('+first[1]+e.target.id.charAt(e.target.id.length-1)+second[1]+')';
            l_items.push(raw_text);
            var line1 = makeSVG('line', {
                x1: parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width')),
                x2: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40),
                y1: parseInt($(first[0]).attr('y'))+parseInt($(first[0]).attr('height')/2),
                y2: parseInt($(first[0]).attr('y'))+parseInt($(first[0]).attr('height')/2),
                stroke: '#000'
            });
            var line2 = makeSVG('line', {
                x1: parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width')),
                x2: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40),
                y1: parseInt($(second[0]).attr('y'))+parseInt($(second[0]).attr('height')/2),
                y2: parseInt($(second[0]).attr('y'))+parseInt($(second[0]).attr('height')/2),
                stroke: '#000'
            })
            var line_together_h = makeSVG('line', {
                x1: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40),
                x2: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40)+60,
                y1: ((parseInt($(first[0]).attr('y'))+parseInt($(first[0]).attr('height')/2))+(parseInt($(second[0]).attr('y'))+parseInt($(second[0]).attr('height')/2)))/2,
                y2: ((parseInt($(first[0]).attr('y'))+parseInt($(first[0]).attr('height')/2))+(parseInt($(second[0]).attr('y'))+parseInt($(second[0]).attr('height')/2)))/2,
                stroke: '#000'
            })
            var line_together_v = makeSVG('line', {
                x1: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40),
                x2: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40),
                y1: parseInt($(first[0]).attr('y'))+parseInt($(first[0]).attr('height')/2),
                y2: parseInt($(second[0]).attr('y'))+parseInt($(second[0]).attr('height')/2),
                stroke: '#000'
            });
            
            var text = $(makeSVG('text', {
                x: 15,
                y: 40*item + 30,
                fill: 'transparent',
            })).text(raw_text);

            mubu.append(text);

            var rectbox = $(makeSVG('rect', {
                x: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40)+60,
                y: ((parseInt($(first[0]).attr('y'))+parseInt($(second[0]).attr('y'))))/2,
                width: text.get(0).getBBox().width+10,
                height: 30,
                stroke: '#aaa',
                fill: '#fff',
                rx: 5,
                ry: 5,
                text: raw_text,
            }));

            var text = $(makeSVG('text', {
                x: Math.max(
                    parseInt($(first[0]).attr('x'))+parseInt($(first[0]).attr('width'))+40,
                    parseInt($(second[0]).attr('x'))+parseInt($(second[0]).attr('width'))+40)+65,
                y: ((parseInt($(first[0]).attr('y'))+parseInt($(second[0]).attr('y'))))/2 + 20,
                fill: '#000',
            })).text(raw_text);

            mubu.append(rectbox, text, line1, line2, line_together_h, line_together_v);
        }
    });
});



