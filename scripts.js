window.onload = function () {
    var svg = Snap('#svg');

    var SIZE = svg.attr('viewBox').width;
    var CENTER = SIZE / 2;

    var line = svg.select('#line');
    var marker = svg.select('#marker');
    var text = svg.select('#text');
    var arc = svg.select('#arc');
    var oppositeArc = svg.select('#oppositeArc');
    var oppositeText = svg.select('#oppositeText');
    var positiveText = svg.select('#positiveText');

    var input = document.getElementById('input');

    ['click', 'keyup'].forEach(function (type) {
        input.addEventListener(type, function () {
            animateAngle(input.value|0);
        });
    });

    svg.mousedown(function (e) {
        setAngle(calcAngle(e.offsetX - svg.node.clientWidth / 2, svg.node.clientHeight / 2 - e.offsetY));
    });

    function calcAngle(x, y) {
        var angle = Math.round(Math.atan2(y, x) * 180 / Math.PI);
        return angle < 0 ? 360 + angle : angle;
    }

    function setAngle(angle) {
        input.value = angle;
        animateAngle(angle);
    }

    function animateAngle(angle) {
        drawLine(angle);
        drawArc(angle);
        drawOppositeArc(angle);
        drawOppositeText(angle);
        drawText(angle);
    }

    function calcPos(angle, length) {
        var radians = angle * Math.PI / 180;
        return {
            x: CENTER + length * Math.cos(radians),
            y: CENTER - length * Math.sin(radians)
        }
    }

    function drawLine(angle) {
        var pos = calcPos(angle, CENTER - 3);
        line.animate({x2: pos.x, y2: pos.y}, 1000, mina.bounce);
    }

    function drawText(angle) {
        var pos = calcPos(angle, CENTER - 1);
        text.attr({text: angle});
        text.animate({x: pos.x, y: pos.y}, 1000, mina.bounce);


        var pos = calcPos(angle / 2, 10);
        positiveText.attr({text: angle + '°'});
        positiveText.animate({x: pos.x, y: pos.y}, 1000, mina.bounce);

        drawTriangles(angle);
    }

    function drawTriangles(angle) {
        console.log(d);
        var pos0 = calcPos(angle, CENTER - 3);
        var pos1 = calcPos(angle - 2, CENTER - 2);
        var pos2 = calcPos(angle + 2, CENTER - 2);

        var d = [
            'M', pos0.x, ',', pos0.y,
            'L', pos1.x, ',', pos1.y,
            'L', pos2.x, ',', pos2.y,
            'Z'
        ].join('');

        marker.animate({d: d}, 1000, mina.bounce);
    }

    function drawOppositeText(angle) {
        if (angle > 180) {
            angle = angle - 360;
            var pos = calcPos(angle / 2, 6);
            oppositeText.attr({text: angle + '°'});
            oppositeText.animate({x: pos.x, y: pos.y}, 1000, mina.bounce);
        } else {
            oppositeText.attr({text: ''});
            oppositeText.animate({x: CENTER, y: CENTER}, 1000, mina.bounce);
        }
    }

    function drawArc(angle) {
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

    setAngle(Math.round(Math.random() * 360));
    // setAngle(225);
};
