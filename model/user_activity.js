import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserActivity = sequelize.define("user_activity", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    activity_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    skill_level: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
        allowNull: false,
    },
    required_equipment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    participant_type: {
        type: DataTypes.ENUM("anyone can join unlimited", "limited"),
        allowNull: false,
    },
    participant_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    }
}, {
    tableName: "user_activity",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default UserActivity;


