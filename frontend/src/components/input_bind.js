import React from 'react';
function InputBind (props) {
  const { val } = props;
  return (
    <input {...props} className="form-control" value={val[0]} onChange={e => val[1](e.target.value)} />
  );
}

export default InputBind;
