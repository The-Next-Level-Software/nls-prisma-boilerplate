// src/modules/otp/otp.service.js

import crypto from "crypto";

import { emailService } from "../../services/email.service.js";
import OtpModel from "./otp.model.js";

class OTPService {
  constructor() {
    this.expiryMinutes = 5; // OTP expiry time
    this.maxAttempts = 3; // Verify attempts per OTP
  }

  /**
   * Generate a random OTP (6-digit)
   */
  generateOTP(length = 6) {
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  /**
   * Hash OTP for secure database store
   */
  hashOTP(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  /**
   * Create & store OTP
   */
  async create(email) {
    const otp = this.generateOTP();
    const hashed = this.hashOTP(otp);

    // Delete any existing OTP for this email
    await OtpModel.deleteByEmail(email);

    // Create new OTP record
    await OtpModel.create({
      email,
      otp: hashed,
      attempts: 0,
      expiresAt: new Date(Date.now() + this.expiryMinutes * 60 * 1000),
    });

    // Send OTP Email
    await emailService.sendOTPEmail(email, otp);

    return {
      message: "OTP sent successfully.",
      email,
      expiryMinutes: this.expiryMinutes,
    };
  }

  /**
   * Verify OTP
   */
  async verify(email, otp) {
    const record = await OtpModel.findByEmail(email);

    if (!record) return { success: false, message: "OTP not found." };

    // Check expiry
    if (record.expiresAt < new Date()) {
      return { success: false, message: "OTP has expired." };
    }

    // Check attempt limit
    if (record.attempts >= this.maxAttempts) {
      return {
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      };
    }

    // Compare hash
    const hashed = this.hashOTP(otp);

    if (hashed !== record.otp) {
      await OtpModel.updateById(record.id, { 
        attempts: record.attempts + 1 
      });

      return { success: false, message: "Invalid OTP." };
    }

    // OTP valid → delete record
    await OtpModel.deleteById(record.id);

    return {
      success: true,
      message: "OTP verified successfully.",
    };
  }

  /**
   * Delete OTP
   */
  async clear(email) {
    await OtpModel.deleteByEmail(email);
  }
}

export const otpService = new OTPService();
