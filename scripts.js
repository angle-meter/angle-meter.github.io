window.onload = function () {
    var input = document.getElementById('input');
    var svg = Snap('#svg');
    var line = svg.select('#line');
    var circ = svg.select('#circ');
    var text = svg.select('#text');

    ['click', 'keyup'].forEach(function (type) {
        input.addEventListener(type, function () {
            animateAngle(input.value);
        });
    });

    svg.mousedown(function (e) {
        setAngle(calcAngle(e.offsetX - svg.node.clientWidth / 2, svg.node.clientHeight / 2 - e.offsetY));
    });

    function setAngle(angle) {
        input.value = angle;
        animateAngle(angle);
    }

    function animateAngle(angle) {
        var lx = 12 + 12 * Math.cos(angle * Math.PI / 180);
        var ly = 12 - 12 * Math.sin(angle * Math.PI / 180);
        var x = 12 + 11 * Math.cos(angle * Math.PI / 180);
        var y = 12 - 11 * Math.sin(angle * Math.PI / 180);

        text.attr({text: angle});
        line.animate({x2: lx, y2: ly}, 1000, mina.bounce);
        text.animate({x: x, y: y}, 1000, mina.bounce);
        circ.animate({cx: x, cy: y}, 1000, mina.bounce);
    }

    function calcAngle(x, y) {
        var angle = Math.atan2(y, x) * 180 / Math.PI | 0;
        return angle < 0 ? 360 + angle : angle;
    }

     animateAngle(Math.random() * 360 | 0);
};
