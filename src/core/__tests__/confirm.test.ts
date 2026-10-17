import { Alert } from 'react-native';
import { cancelButton, backToEditButton, okButton, confirm } from '../confirm';

jest.spyOn(Alert, 'alert');

describe('Confirm module (Apple HIG & Interaction Guard S1/S5)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('generates standardized cancelButton with "Anuluj" and style cancel', () => {
    const cb = cancelButton();
    expect(cb.text).toBe('Anuluj');
    expect(cb.style).toBe('cancel');
    expect(cb.onPress).toBeUndefined();

    const onPress = jest.fn();
    const cbWithPress = cancelButton(onPress);
    expect(cbWithPress.onPress).toBe(onPress);
  });

  it('generates backToEditButton with "Wróć do edycji"', () => {
    const bte = backToEditButton();
    expect(bte.text).toBe('Wróć do edycji');
    expect(bte.style).toBe('cancel');
  });

  it('generates okButton with "OK"', () => {
    const ok = okButton();
    expect(ok.text).toBe('OK');
    expect(ok.style).toBe('cancel');
  });

  it('invokes Alert.alert with cancel button and destructive action', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    confirm({
      title: 'Usunąć projekt?',
      message: 'Operacji nie można cofnąć.',
      action: 'Usuń',
      destructive: true,
      onConfirm,
      onCancel,
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Usunąć projekt?',
      'Operacji nie można cofnąć.',
      [
        expect.objectContaining({ text: 'Anuluj', style: 'cancel' }),
        expect.objectContaining({ text: 'Usuń', style: 'destructive' }),
      ]
    );
  });

  it('invokes Alert.alert without destructive style when false', () => {
    const onConfirm = jest.fn();

    confirm({
      title: 'Zastosować szablon?',
      action: 'Zastosuj',
      onConfirm,
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Zastosować szablon?',
      undefined,
      [
        expect.objectContaining({ text: 'Anuluj', style: 'cancel' }),
        expect.objectContaining({ text: 'Zastosuj' }),
      ]
    );
  });
});
