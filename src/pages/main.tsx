'use client';
import { useState, ChangeEvent, FormEvent } from 'react';

export default function main() {
  const [formState, setFormState] = useState({
    name: '',
    address: '',
    logo: '',
    contactDetails: '',
    brandColors: '',
    brandFonts: '',
    backgroundDesign: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" name="name" value={formState.name} onChange={handleChange} />
      </label>
      <label>
        Address:
        <input type="text" name="address" value={formState.address} onChange={handleChange} />
      </label>
      <label>
        Logo:
        <input type="text" name="logo" value={formState.logo} onChange={handleChange} />
      </label>
      <label>
        Contact Details:
        <input type="text" name="contactDetails" value={formState.contactDetails} onChange={handleChange} />
      </label>
      <label>
        Brand Colors:
        <input type="text" name="brandColors" value={formState.brandColors} onChange={handleChange} />
      </label>
      <label>
        Brand Fonts:
        <input type="text" name="brandFonts" value={formState.brandFonts} onChange={handleChange} />
      </label>
      <label>
        Background Design:
        <input type="text" name="backgroundDesign" value={formState.backgroundDesign} onChange={handleChange} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
