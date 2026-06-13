import React, { forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  type?: string;
  options?: { value: string; label: string }[];
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, InputProps>(
  ({ label, error, helperText, type = 'text', options, className = '', ...props }, ref) => {
    
    const inputClasses = [
      styles.input,
      error ? styles.inputError : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={styles.container}>
        {label && <label className={styles.label}>{label}</label>}
        
        {type === 'textarea' ? (
          <textarea 
            className={inputClasses} 
            ref={ref as any} 
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} 
          />
        ) : type === 'select' ? (
          <select 
            className={inputClasses} 
            ref={ref as any}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="" disabled>Select an option</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input 
            type={type} 
            className={inputClasses} 
            ref={ref as any} 
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)} 
          />
        )}

        {(error || helperText) && (
          <span className={error ? styles.errorText : styles.helperText}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
