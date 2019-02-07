window.onload = function () {

    console.log(111);
    var svg = Snap('#svg');

    document.getElementById('input').addEventListener('click', xxx);
    document.getElementById('input').addEventListener('keyup', xxx);

    function xxx() {
        setAngle(document.getElementById('input').value);
    }

    svg.mousedown(function (e) {
        var angle = calcAngle(e.offsetX - svg.node.clientWidth / 2, svg.node.clientHeight / 2 - e.offsetY);
        setAngle(angle);
        $('#input').val(angle);
    });

    var line = svg.line(12, 12, 12, 12);
    var circ = svg.circle(12, 12, 0.5);
    var text = svg.text(12, 12, '0');

    line.attr({
        class: 'main-line'
    });

    text.attr({
        class: 'main-text'
    });

    circ.attr({
        class: 'main-circ'
    });

    function setAngle(angle) {
        console.log(angle);
        var lx = 12 + 100 * Math.cos(angle * Math.PI / 180);
        var ly = 12 - 100 * Math.sin(angle * Math.PI / 180);
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
        // return angle;
    }
}
