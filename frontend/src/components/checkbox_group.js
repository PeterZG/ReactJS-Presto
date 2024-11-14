import Form from 'react-bootstrap/Form';
import React from 'react';

function CheckboxGroup (props) {
  const { children } = props;
  const handleChange = (e) => {
    props.onChange(e.target.checked);
  };
  return (
    <Form.Group className='mb-3'>
      <Form.Label>
        <input
          type='checkbox'
          value={props.value}
          onChange={handleChange}
          className='me-2'
          checked={props.checked}
        />
        {children}
      </Form.Label>
    </Form.Group>
  );
}

export default CheckboxGroup;
