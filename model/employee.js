import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employee = sequelize.define('user', {
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  email_address: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },  
  resetOTP: {
    type: DataTypes.STRING,
    field: 'reset_otp'
  },
  resetOTPExpiry: {
    type: DataTypes.DATE,
    field: 'reset_otp_expiry'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user',
  timestamps: false,

});

export default Employee;
  




