const init = (degrees) => {
    let accelerometerConfirmed = false;

    const indicator = Indicator({
        changeCallback: (degrees) => {
            angleInput.setValue(Math.round(degrees));
        }
    });

    const accelerometerCheckbox = AccelerometerCheckbox({
        changeCallback: (checked) => {
            angleInput.setReadonly(checked);
            if (checked) {
                accelerometer.start();
            } else {
                accelerometer.stop();
            }
        }
    });

    const angleInput = AngleInput({
        changeCallback: (degrees) => {
            indicator.setDegrees(degrees);
        }
    });

    const accelerometer = AngleAccelerometer({
        changeCallback: (degrees) => {
            if (!accelerometerConfirmed) {
                accelerometerConfirmed = true;
                accelerometerCheckbox.setChecked(true);
                accelerometerCheckbox.setEnabled(true);
            }
            indicator.setDegrees(degrees);
            angleInput.setValue(Math.round(degrees));

        },
        errorCallback: (error) => {
            accelerometerCheckbox.setTooltip(error);
            accelerometerCheckbox.setChecked(false);
            accelerometerCheckbox.setEnabled(false);
        }
    });

    const initialAngle = degrees ?? Math.round(Math.random() * 180);
    indicator.setDegrees(initialAngle);
    angleInput.setValue(initialAngle);
}

const AccelerometerCheckbox = ({changeCallback}) => {
    const element = document.getElementById('accelerometer-checkbox');
    element.addEventListener('change', () => changeCallback(element.checked));

    const setEnabled = (enabled) => element.disabled = !enabled
    const setChecked = (checked) => element.checked = checked;
    const setTooltip = (text) => element.parentElement.title = text;
    return {setEnabled, setChecked, setTooltip};
}

const AngleInput = ({changeCallback}) => {
    const element = document.getElementById('angle-input');
    let value;
    const onChange = () => {
        if (value !== element.value) {
            value = element.value;
            changeCallback(Number(value));
        }
    };

    element.addEventListener('keyup', onChange);
    element.addEventListener('change', onChange);

    const setValue = (newValue) => {
        value = `${newValue}`;
        element.value = value;
    };

    const setReadonly = (readonly) => element.readOnly = readonly;

    return {setValue, setReadonly};
}

const Indicator = ({changeCallback}) => {
    const svg = document.getElementById('svg');
    const pointerLine = svg.getElementById('pointerLine');
    const pointerExtraLine = svg.getElementById('pointerExtraLine');
    const pointerMarker = svg.getElementById('pointerMarker');
    const arc = svg.getElementById('arc');
    const arcRadius = Number(arc.getAttribute('r'));
    const arcOpposite = svg.getElementById('arcOpposite');
    const arcOppositeRadius = Number(arcOpposite.getAttribute('r'));
    const arcText = svg.getElementById('arcText');
    const arcOppositeText = svg.getElementById('arcOppositeText');
    let degrees;

    const setDegrees = (newDegrees) => {
        if (newDegrees - degrees > 180) {
            degrees = newDegrees - 360;
        } else if (degrees - newDegrees > 180) {
            degrees = 360 + newDegrees;
        } else {
            degrees = newDegrees;
        }
        degrees = degrees % 360;
        repaint();
    }

    const repaint = () => {
        const radians = degrees * Math.PI / 180;
        pointerLine.setAttribute('transform', `rotate(${-degrees})`);
        pointerExtraLine.setAttribute('transform', `rotate(${-degrees})`);
        pointerMarker.setAttribute('transform', `rotate(${-degrees})`);

        const roundDegrees = Math.round(degrees);
        arc.setAttribute('stroke-dashoffset', (radians - Math.PI * 2) * arcRadius);
        arcText.textContent = `${roundDegrees}°`;
        arcText.setAttribute('transform',
            `rotate(${-degrees / 2} 0 0) rotate(${degrees / 2} ${arcRadius} 0)`);

        arcOpposite.setAttribute('opacity', degrees > 180 || degrees < -180 ? 0.5 : 0);
        arcOppositeText.setAttribute('opacity', degrees > 180 || degrees < -180 ? 1 : 0);
        arcOpposite.setAttribute('stroke-dashoffset', radians * arcOppositeRadius);
        arcOppositeText.textContent = `${(roundDegrees - 360 * Math.sign(roundDegrees))}°`;
        arcOppositeText.setAttribute('transform',
            `rotate(${(360 - degrees) / 2})  rotate(${(degrees - 360) / 2} ${arcOppositeRadius} 0)`);
    }

    svg.addEventListener('wheel', (event) => {
        const {clientWidth, clientHeight} = svg;
        const eventRadius = Math.sqrt(
            Math.pow(event.offsetX - clientWidth / 2, 2) +
            Math.pow(clientHeight / 2 - event.offsetY, 2)
        );
        const boundRadius = Math.min(clientWidth, clientHeight) / 2;
        if (boundRadius > eventRadius) {
            setDegrees(Math.round(degrees - Math.sign(event.deltaY)));
            changeCallback(degrees);
            event.preventDefault();
            return false;
        }
    }, {passive: false});

    svg.addEventListener('mousedown', ({offsetX, offsetY}) => {
        setDegrees(Math.atan2(svg.clientHeight / 2 - offsetY, offsetX - svg.clientWidth / 2) * 180 / Math.PI);
        changeCallback(degrees);
    });

    return {setDegrees};
}

const AngleAccelerometer = ({frequency = 4, precision = 1, changeCallback, errorCallback}) => {
    let degrees = 0;
    let error = null;
    let available = false;

    const normalizeGravity = (x, y) => {
        switch (screen.orientation.type) {
            case 'portrait-secondary':
                return {x: -x, y: -y};
            case 'landscape-primary':
                return {x: -y, y: x};
            case 'landscape-secondary':
                return {x: y, y: -x};
            default:
                return {x, y};
        }
    };

    const handleValue = ({x, y}) => {
        available = true;
        error = null;
        const normalized = normalizeGravity(x, y);
        const newDegrees = Math.atan2(normalized.y, normalized.x) * 180 / Math.PI;
        if (Math.abs(newDegrees - degrees) > precision) {
            degrees = newDegrees;
            changeCallback(degrees);
        }
    };

    const handleError = ({name}) => {
        available = false;
        switch (name) {
            case 'NotAllowedError':
            case 'SecurityError':
                error = `Cannot access the accelerometer. ${name}`;
                break;
            case 'NotReadableError':
            case 'ReferenceError':
            case 'NotSupported':
                error = `Cannot connect to the accelerometer. ${name}`;
                break;
            default:
                error = name;
        }
        errorCallback(error);
    };

    const createAccelerometer = () => {
        if ('Accelerometer' in window) {
            try {
                const accelerometer = new Accelerometer({frequency});
                accelerometer.onerror = ({error}) => handleError(error);
                accelerometer.onreading = () => handleValue(accelerometer);
                accelerometer.start();
                return accelerometer;
            } catch (error) {
                handleError(error);
            }
        } else {
            handleError({name: 'NotSupported'});
        }
        return null;
    };

    const accelerometer = createAccelerometer();

    const start = () => accelerometer?.start();
    const stop = () => accelerometer?.stop();
    const isAvailable = () => available;
    const getError = () => error;

    return {start, stop, isAvailable, getError};
}
