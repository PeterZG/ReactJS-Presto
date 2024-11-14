const rangeValue = (value, minValue, maxValue, oldValue) => {
  oldValue = Number(oldValue);
  if (value < minValue) {
    return oldValue || minValue;
  } else if (value > maxValue) {
    return oldValue || maxValue;
  } else {
    return Number(value);
  }
}

const defaultSlide = () => {
  return { name: 'default', layer: 10, items: [], bg: '', useGradient: false, color: '', colorStart: '', colorEnd: '' };
}

export {
  rangeValue,
  defaultSlide
}
