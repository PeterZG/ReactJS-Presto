import React from 'react';
function InputBind (props) {
  const { val, ...inputProps } = props;
  return (
    <input
      {...inputProps}
      className="form-control"
      value={val[0]}
      onChange={(e) => val[1](e.target.value)}
    />
  );
}

export default InputBind;
