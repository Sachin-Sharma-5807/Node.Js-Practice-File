import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
const DeviceToken = sequelize.define('device_token', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,

    },
    auth_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    fcm_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    device_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    device_type: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'device_token',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default DeviceToken;