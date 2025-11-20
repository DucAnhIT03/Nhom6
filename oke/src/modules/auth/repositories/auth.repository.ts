import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../shared/entities/user.entity';
import { Role } from '../../../shared/entities/role.entity';
import { RegisterDto } from '../dtos/request/register.dto';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async createUser(registerDto: RegisterDto, hashedPassword: string): Promise<User> {
    const user = this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashedPassword,
      phone: registerDto.phone,
      status: 'ACTIVE',
    });

    return await this.userRepository.save(user);
  }

  async findRoleByName(roleName: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { roleName: roleName as any },
    });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    // Check if user exists (without loading relations)
    const userExists = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
    });

    if (!userExists) {
      throw new Error('User not found');
    }

    // Check if role exists
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      select: ['id'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if relation already exists using raw query
    const existingRelation = await this.userRepository
      .createQueryBuilder()
      .select('1')
      .from('user_role', 'ur')
      .where('ur.user_id = :userId', { userId })
      .andWhere('ur.role_id = :roleId', { roleId })
      .getRawOne();

    // Only add if not exists
    if (!existingRelation) {
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'roles')
        .of(userId)
        .add(roleId);
    }
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :userId', { userId })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    return user?.roles || [];
  }

  async updateUserStatus(userId: number, status: 'ACTIVE' | 'BLOCKED'): Promise<void> {
    await this.userRepository.update(userId, { status });
  }

  async updateUser(userId: number, updateData: { firstName?: string; lastName?: string; phone?: string }): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }

    return await this.userRepository.save(user);
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findUserByIdWithRoles(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }
}

