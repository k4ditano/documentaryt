import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PageAttributes {
  id: number;
  title: string;
  content: string | null;
  parent_id: number | null;
  user_id: number;
  position: number;
  tags: string;
}

interface PageCreationAttributes extends Optional<PageAttributes, 'id'> {}

class Page extends Model<PageAttributes, PageCreationAttributes> implements PageAttributes {
  public id!: number;
  public title!: string;
  public content!: string | null;
  public parent_id!: number | null;
  public user_id!: number;
  public position!: number;
  public tags!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Page.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'folders',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.STRING,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: string[] | string) {
        this.setDataValue('tags', 
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      },
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