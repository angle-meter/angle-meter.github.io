window.onload = function () {
    var svg = Snap('#svg');

    var SIZE = svg.attr('viewBox').width;
    var CENTER = SIZE / 2;

    var pointerLine = svg.select('#pointerLine');

    var pointerMarker = svg.select('#pointerMarker');
    var pointerText = svg.select('#pointerText');
    var arc = svg.select('#arc');
    var arcText = svg.select('#arcText');
    var oppositeArc = svg.select('#oppositeArc');
    var oppositeArcText = svg.select('#oppositeArcText');

    var input = document.getElementById('input');

    function addMouseListener() {
        var pt = svg.node.createSVGPoint();
        svg.mousedown(function (e) {
            pt.x = e.clientX;
            pt.y = e.clientY;
            var pos = pt.matrixTransform(svg.node.getScreenCTM().inverse());
            setAngle(calcAngle(pos.x - CENTER, CENTER - pos.y));
        });
    }

    function addInputListener() {
        ['click', 'keyup'].forEach(function (type) {
            input.addEventListener(type, function () {
                animateAngle(input.value | 0);
            });
        });
    }

    function calcAngle(x, y) {
        var angle = Math.round(Math.atan2(y, x) * 180 / Math.PI);
        return angle < 0 ? 360 + angle : angle;
    }

    function setAngle(angle) {
        input.value = angle;
        animateAngle(angle);
    }

    function animateAngle(angle) {
        var normAngle = angle % 360;
        drawPointerLine(normAngle);
        drawPointerTriangle(normAngle);
        drawPointerText(normAngle, angle);
        drawArc(normAngle);
        drawArcText(normAngle, angle + '°');
        drawOppositeArc(normAngle);
        drawOppositeArcText(normAngle, (angle - 360) + '°');
    }

    function calcPos(angle, length) {
        var radians = angle * Math.PI / 180;
        return {
            x: CENTER + length * Math.cos(radians),
            y: CENTER - length * Math.sin(radians)
        }
    }

    function drawPointerLine(angle) {
        var pos = calcPos(angle, CENTER - 3);
        pointerLine.animate({x2: pos.x, y2: pos.y}, 1000, mina.bounce);
    }

    function drawPointerText(angle, text) {
        var pos = calcPos(angle, CENTER - 1);
        pointerText.attr({text: text});
        pointerText.animate({x: pos.x, y: pos.y}, 1000, mina.bounce);
    }

    function drawPointerTriangle(angle) {
        var pos0 = calcPos(angle, CENTER - 3);
        var pos1 = calcPos(angle - 2, CENTER - 2);
        var pos2 = calcPos(angle + 2, CENTER - 2);

        var d = [
            'M', pos0.x, ',', pos0.y,
            'L', pos1.x, ',', pos1.y,
            'L', pos2.x, ',', pos2.y,
            'Z'
        ].join('');

        pointerMarker.animate({d: d}, 1000, mina.bounce);
    }


    function drawArc(angle) {
        if (angle === 0) {
            arc.animate({d: 'M' + CENTER + ',' + CENTER}, 1000, mina.bounce);
            return;
        }

        var size1 = 12;
        var pos = calcPos(angle, size1);
        var size2 = 8;
        var pos2 = calcPos(angle, size2);

        var xRot = angle > 180 ? 0 : 1;
        var largeFlag = angle <= 180 ? 0 : 1;

        var d = [
            'M', CENTER, ',', CENTER,
            'L', CENTER + size1, ',', CENTER,
            'A', size1, ',', size1, ',', xRot, ',', largeFlag, ',0,', pos.x, ',', pos.y,
            'L', pos2.x, ',', pos2.y,
            'A', size2, ',', size2, ',', xRot, ',', largeFlag, ',1,', CENTER + size2, ',', CENTER,
            'Z'
        ].join('');

        arc.animate({d: d}, 1000, mina.bounce);
    }

    function drawOppositeArc(angle) {
        if (angle > 180) {
            var size = 8;
            var pos = calcPos(angle, size);
            var d = [
                'M', CENTER, ',', CENTER,
                'L', CENTER + size, ',', CENTER,
                'A', size, ',', size, ',0,0,1,', pos.x, ',', pos.y,
                'Z'
            ].join('');
            oppositeArc.animate({d: d}, 1000, mina.bounce);
        } else {
            oppositeArc.animate({d: 'M' + CENTER + ',' + CENTER}, 1000, mina.bounce);
        }
    }

    function drawArcText(angle, text) {
        if (angle >= 10) {
            var pos = calcPos(angle / 2, 10);
            arcText.attr({text: text});
            arcText.animate({x: pos.x, y: pos.y}, 1000, mina.bounce);
        } else {
            arcText.attr({x: CENTER, y: CENTER, text: ''});
        }
    }

    function drawOppositeArcText(angle, text) {
        if (angle > 180 && angle <= 350) {
            angle = angle - 360;
            var pos = calcPos(angle / 2, 6);
            oppositeArcText.attr({text: text});
            oppositeArcText.animate({x: pos.x, y: pos.y}, 1000, mina.bounce);
        } else {
            oppositeArcText.attr({x: CENTER, y: CENTER, text: ''});
        }
    }

    addMouseListener();
    addInputListener();
    setAngle(Math.round(Math.random() * 360));
    // setAngle(330);
};
