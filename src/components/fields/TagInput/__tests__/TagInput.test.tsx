import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../TagInput';

const getInput = () => screen.getByRole('combobox');

describe('TagInput', () => {
  it('adds a tag on Enter', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);

    const input = getInput();
    fireEvent.change(input, { target: { value: 'brave' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['brave']);
  });

  it('adds a tag on the comma delimiter', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);

    const input = getInput();
    fireEvent.change(input, { target: { value: 'wary' } });
    fireEvent.keyDown(input, { key: ',' });

    expect(onChange).toHaveBeenCalledWith(['wary']);
  });

  it('removes the last tag on Backspace when input is empty', () => {
    const onChange = vi.fn();
    render(<TagInput value={['one', 'two']} onChange={onChange} />);

    fireEvent.keyDown(getInput(), { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['one']);
  });

  it('does not remove a tag on Backspace when the input has text', () => {
    const onChange = vi.fn();
    render(<TagInput value={['one']} onChange={onChange} />);

    const input = getInput();
    fireEvent.change(input, { target: { value: 'typing' } });
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a tag when its remove button is clicked', () => {
    const onChange = vi.fn();
    render(<TagInput value={['alpha', 'beta']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove trait: alpha' }));

    expect(onChange).toHaveBeenCalledWith(['beta']);
  });

  it('rejects a duplicate tag', () => {
    const onChange = vi.fn();
    render(<TagInput value={['dup']} onChange={onChange} />);

    const input = getInput();
    fireEvent.change(input, { target: { value: 'dup' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects empty / whitespace-only input', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);

    const input = getInput();
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace from an added tag', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);

    const input = getInput();
    fireEvent.change(input, { target: { value: '  spaced  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['spaced']);
  });

  it('adds the active suggestion when Enter is pressed after arrowing into the list', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} suggestions={['cautious', 'curious']} />);

    const input = getInput();
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['cautious']);
  });

  it('adds a suggestion when its option is clicked', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} suggestions={['cautious', 'curious']} />);

    const input = getInput();
    fireEvent.focus(input);
    fireEvent.pointerDown(screen.getByRole('option', { name: 'curious' }));

    expect(onChange).toHaveBeenCalledWith(['curious']);
  });

  it('does not offer already-selected suggestions', () => {
    const onChange = vi.fn();
    render(<TagInput value={['cautious']} onChange={onChange} suggestions={['cautious', 'curious']} />);

    const input = getInput();
    fireEvent.focus(input);

    expect(screen.queryByRole('option', { name: 'cautious' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'curious' })).toBeInTheDocument();
  });
});
