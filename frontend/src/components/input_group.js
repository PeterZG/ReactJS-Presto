import Form from 'react-bootstrap/Form';
import React from 'react';

function InputGroup (props) {
  const { children } = props;
  const handleChange = (e) => {
    props.onChange(e.target.value);
  };
  return (
    <Form.Group className='mb-3'>
      <Form.Label>{children}</Form.Label>
      <Form.Control
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={handleChange}
        min={props.min}
        max={props.max}
      />
    </Form.Group>
  );
}

export default InputGroup;
