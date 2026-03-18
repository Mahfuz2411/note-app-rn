export function validateNote(titleInput: string, contentInput: string): string | null {
  if (!titleInput.trim() && !contentInput.trim()) {
    return 'Write a title or some content first.';
  }

  return null;
}

export function validatePin(
  protectEnabled: boolean,
  pinInput: string,
  isEditing: boolean,
  hasExistingPin: boolean,
): string | null {
  if (!protectEnabled) {
    return null;
  }

  if (!pinInput && !isEditing) {
    return 'Set a 4-digit PIN to protect this note.';
  }

  if (!pinInput && isEditing && hasExistingPin) {
    return null;
  }

  if (!/^\d{4}$/.test(pinInput)) {
    return 'PIN must be exactly 4 digits.';
  }

  return null;
}
