import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface PageAttributes {
  id: string;
  title: string;
  content: string;
  parent_id: string | null;
  position: number;
  tags?: string;
}

class Page extends Model<PageAttributes> implements PageAttributes {
  public id!: string;
  public title!: string;
  public content!: string;
  public parent_id!: string | null;
  public position!: number;
  public tags!: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Page.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Page',
    tableName: 'pages',
    timestamps: true,
    underscored: true,
  }
);

export default Page; 