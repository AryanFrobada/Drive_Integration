import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserTokens {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({nullable: true})
  email?: string;

  @Column({ nullable: true })
  googleAccessToken?: string;

  @Column({ nullable: true })
  googleRefreshToken?: string;

  @Column({ nullable: true })
  oneDriveAccessToken?: string;

  @Column({ nullable: true })
  oneDriveRefreshToken?: string;

  @Column({ nullable: true })
  dropboxAccessToken?: string;

  @Column({ nullable: true })
  dropboxRefreshToken?: string;
}




// // backend/src/models/UserTokens.ts
// import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// @Entity()
// export class UserTokens {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Column()
//   userId!: string; // Or another identifier for the user

//   @Column({ nullable: true })
//   googleAccessToken?: string;

//   @Column({ nullable: true })
//   googleRefreshToken?: string;

//   @Column({ nullable: true })
//   oneDriveAccessToken?: string;

//   @Column({ nullable: true })
//   oneDriveRefreshToken?: string;

//   @Column({ nullable: true })
//   dropboxAccessToken?: string;

//   @Column({ nullable: true })
//   dropboxRefreshToken?: string;

//   // Optionally, store token expiration times
//   @Column({ type: 'timestamp', nullable: true })
//   googleTokenExpiresAt?: Date;

//   @Column({ type: 'timestamp', nullable: true })
//   oneDriveTokenExpiresAt?: Date;

//   @Column({ type: 'timestamp', nullable: true })
//   dropboxTokenExpiresAt?: Date;
// }
