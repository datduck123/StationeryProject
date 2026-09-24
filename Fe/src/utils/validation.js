/**
 * Frontend Validation Utility
 * Contains all form validation rules, regex patterns, and specific English error messages.
 */

// Regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(\+84|0)[0-9]{9,10}$/;
export const OTP_REGEX = /^[0-9]{6}$/;
// Full Name: allows letters, spaces, unicode characters (Vietnamese, accents), min 2, max 100
export const FULL_NAME_REGEX = /^[\p{L}\s'-]{2,100}$/u;

// Special characters accepted for password matching backend: @#$!%*?&
export const PASSWORD_SPECIAL_CHARS = "@#$!%*?&";
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,20}$/;

/**
 * Validate email address
 * @param {string} email
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: "Email address is required." };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      error: "Please enter a valid email address (e.g. user@example.com).",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validate full name
 * @param {string} fullName
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: "Full name is required." };
  }
  const trimmed = fullName.trim();
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "Full name must be at least 2 characters.",
    };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: "Full name cannot exceed 100 characters." };
  }
  if (!FULL_NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "Full name should only contain letters and spaces.",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validate password with specific, detailed English error messages
 * Checks individual rules so user knows exactly what is missing
 * @param {string} password
 * @param {string} fieldName - optional custom name (e.g. "New password")
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePassword = (password, fieldName = "Password") => {
  if (!password) {
    return { isValid: false, error: `${fieldName} is required.` };
  }
  if (/\s/.test(password)) {
    return { isValid: false, error: `${fieldName} cannot contain spaces.` };
  }
  if (password.length < 8) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 8 characters long.`,
    };
  }
  if (password.length > 20) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed 20 characters.`,
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: `${fieldName} must include at least one lowercase letter (a-z).`,
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: `${fieldName} must include at least one uppercase letter (A-Z).`,
    };
  }
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: `${fieldName} must include at least one digit (0-9).`,
    };
  }
  if (!/[@#$!%*?&]/.test(password)) {
    return {
      isValid: false,
      error: `${fieldName} must include at least one special character (@#$!%*?&).`,
    };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: `${fieldName} must be 8-20 characters long and include uppercase, lowercase, digit, and special character (@#$!%*?&).`,
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validate confirm password
 * @param {string} password
 * @param {string} confirmPassword
 * @param {string} confirmFieldName
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateConfirmPassword = (
  password,
  confirmPassword,
  confirmFieldName = "Confirm password",
) => {
  if (!confirmPassword) {
    return { isValid: false, error: `${confirmFieldName} is required.` };
  }
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match. Please verify and retype.",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validate phone number (optional or required)
 * @param {string} phone
 * @param {boolean} isRequired
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validatePhone = (phone, isRequired = false) => {
  if (!phone || !phone.trim()) {
    if (isRequired) {
      return { isValid: false, error: "Phone number is required." };
    }
    return { isValid: true, error: null };
  }
  if (!PHONE_REGEX.test(phone.trim())) {
    return {
      isValid: false,
      error: "Please enter a valid phone number (10 digits, e.g. 0912345678).",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validate address (optional or required)
 * @param {string} address
 * @param {boolean} isRequired
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateAddress = (address, isRequired = false) => {
  if (!address || !address.trim()) {
    if (isRequired) {
      return { isValid: false, error: "Address is required." };
    }
    return { isValid: true, error: null };
  }
  if (address.trim().length < 5) {
    return {
      isValid: false,
      error: "Address must be at least 5 characters long.",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validate 6-digit OTP code
 * @param {string} otp
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateOtp = (otp) => {
  if (!otp || !otp.trim()) {
    return { isValid: false, error: "Verification OTP code is required." };
  }
  if (!OTP_REGEX.test(otp.trim())) {
    return {
      isValid: false,
      error: "Please enter all 6 numeric digits of the OTP code.",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Composite validator: Login Form
 * @param {{ email: string, password: string }} data
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateLoginForm = ({ email, password }) => {
  const emailRes = validateEmail(email);
  if (!emailRes.isValid) return emailRes;

  if (!password) {
    return { isValid: false, error: "Password is required." };
  }
  return { isValid: true, error: null };
};

/**
 * Composite validator: Register Form Step 1
 * @param {{ fullName: string, email: string, password: string, confirmPassword: string, agreeTerms: boolean }} data
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateRegisterStep1 = ({
  fullName,
  email,
  password,
  confirmPassword,
  agreeTerms,
}) => {
  const nameRes = validateFullName(fullName);
  if (!nameRes.isValid) return nameRes;

  const emailRes = validateEmail(email);
  if (!emailRes.isValid) return emailRes;

  const passRes = validatePassword(password, "Password");
  if (!passRes.isValid) return passRes;

  const confirmRes = validateConfirmPassword(password, confirmPassword);
  if (!confirmRes.isValid) return confirmRes;

  if (!agreeTerms) {
    return {
      isValid: false,
      error: "Please agree to the Terms of Service and Privacy Policy.",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Composite validator: Reset Password Form
 * @param {{ newPassword: string, confirmNewPassword: string }} data
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateResetPasswordForm = ({
  newPassword,
  confirmNewPassword,
}) => {
  const passRes = validatePassword(newPassword, "New password");
  if (!passRes.isValid) return passRes;

  const confirmRes = validateConfirmPassword(
    newPassword,
    confirmNewPassword,
    "Confirm new password",
  );
  if (!confirmRes.isValid) return confirmRes;

  return { isValid: true, error: null };
};

/**
 * Composite validator: Change Password Form
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateChangePasswordForm = ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  if (!currentPassword) {
    return { isValid: false, error: "Current password is required." };
  }

  const passRes = validatePassword(newPassword, "New password");
  if (!passRes.isValid) return passRes;

  if (currentPassword === newPassword) {
    return {
      isValid: false,
      error: "New password cannot be the same as your current password.",
    };
  }

  const confirmRes = validateConfirmPassword(
    newPassword,
    confirmPassword,
    "Confirm new password",
  );
  if (!confirmRes.isValid) return confirmRes;

  return { isValid: true, error: null };
};

/**
 * Composite validator: Profile Information Form
 * @param {{ fullName: string, phone?: string, address?: string }} data
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateProfileForm = ({ fullName, phone, address }) => {
  const nameRes = validateFullName(fullName);
  if (!nameRes.isValid) return nameRes;

  const phoneRes = validatePhone(phone, false);
  if (!phoneRes.isValid) return phoneRes;

  const addressRes = validateAddress(address, false);
  if (!addressRes.isValid) return addressRes;

  return { isValid: true, error: null };
};

/**
 * Composite validator: Admin User Form (Add / Edit)
 * @param {{ fullName: string, email?: string, phone?: string, isEdit?: boolean }} data
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateAdminUserForm = ({
  fullName,
  email,
  phone,
  isEdit = false,
}) => {
  const nameRes = validateFullName(fullName);
  if (!nameRes.isValid) return nameRes;

  if (!isEdit) {
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) return emailRes;
  }

  const phoneRes = validatePhone(phone, false);
  if (!phoneRes.isValid) return phoneRes;

  return { isValid: true, error: null };
};

export default {
  validateEmail,
  validateFullName,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateAddress,
  validateOtp,
  validateLoginForm,
  validateRegisterStep1,
  validateResetPasswordForm,
  validateChangePasswordForm,
  validateProfileForm,
  validateAdminUserForm,
};
