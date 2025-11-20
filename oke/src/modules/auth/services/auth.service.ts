import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDto } from '../dtos/request/register.dto';
import { LoginDto } from '../dtos/request/login.dto';
import { UpdateProfileDto } from '../dtos/request/update-profile.dto';
import { ChangePasswordDto } from '../dtos/request/change-password.dto';
import { UpdateUserStatusDto } from '../dtos/request/update-user-status.dto';
import { CreateAdminDto } from '../dtos/request/create-admin.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { UserProfileDto } from '../dtos/response/user-profile.dto';
import { UserStatus } from '../../../common/constraints';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.authRepository.createUser(registerDto, hashedPassword);

    // Assign default role (ROLE_USER)
    const defaultRole = await this.authRepository.findRoleByName('ROLE_USER');
    if (defaultRole) {
      await this.authRepository.assignRoleToUser(user.id, defaultRole.id);
    }

    // Get user roles
    const roles = await this.authRepository.getUserRoles(user.id);
    const roleNames = roles.map((role) => role.roleName);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: roleNames,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.authRepository.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check if user is blocked
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Get user roles
    const roles = await this.authRepository.getUserRoles(user.id);
    const roleNames = roles.map((role) => role.roleName);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: roleNames,
      },
    };
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Use roles from the user object instead of making another query
    const roles = user.roles || [];
    const roleNames = roles.map((role) => role.roleName);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: roleNames,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async registerAdmin(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.authRepository.createUser(registerDto, hashedPassword);

    // Assign ADMIN role
    const adminRole = await this.authRepository.findRoleByName('ROLE_ADMIN');
    if (adminRole) {
      await this.authRepository.assignRoleToUser(user.id, adminRole.id);
    }

    // Get user roles
    const roles = await this.authRepository.getUserRoles(user.id);
    const roleNames = roles.map((role) => role.roleName);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: roleNames,
      },
    };
  }

  async loginAdmin(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.authRepository.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check if user is blocked
    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Get user roles
    const roles = await this.authRepository.getUserRoles(user.id);
    const roleNames = roles.map((role) => role.roleName);

    // Check if user has ADMIN role
    if (!roleNames.includes('ROLE_ADMIN')) {
      throw new UnauthorizedException('Bạn không có quyền truy cập admin');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: roleNames,
      },
    };
  }

  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.authRepository.findUserByEmail(email);
    return !!user;
  }

  async validateUser(userId: number): Promise<any> {
    const user = await this.authRepository.findUserById(userId);
    if (!user || user.status === UserStatus.BLOCKED) {
      return null;
    }

    // Use roles from the user object instead of making another query
    const roles = user.roles || [];
    const roleNames = roles.map((role) => role.roleName);

    return {
      id: user.id,
      email: user.email,
      roles: roleNames,
    };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updateData: { firstName?: string; lastName?: string; phone?: string } = {};
    if (updateProfileDto.firstName !== undefined) {
      updateData.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.phone !== undefined) {
      updateData.phone = updateProfileDto.phone;
    }

    const updatedUser = await this.authRepository.updateUser(userId, updateData);
    
    // Reload user with roles to get updated data
    const userWithRoles = await this.authRepository.findUserById(userId);
    const roles = userWithRoles?.roles || [];
    const roleNames = roles.map((role) => role.roleName);

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      status: updatedUser.status,
      roles: roleNames,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Update password
    await this.authRepository.updateUserPassword(userId, hashedPassword);
  }

  async getAllUsers(): Promise<any[]> {
    const users = await this.authRepository.getAllUsers();
    return users.map((user) => {
      const roles = user.roles || [];
      const roleNames = roles.map((role) => role.roleName);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: roleNames,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });
  }

  async updateUserStatus(userId: number, updateStatusDto: UpdateUserStatusDto): Promise<UserProfileDto> {
    // Check if user exists first
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Update status
    await this.authRepository.updateUserStatus(userId, updateStatusDto.status);

    // Get updated user with roles (only one query after update)
    const updatedUser = await this.authRepository.findUserByIdWithRoles(userId);
    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng sau khi cập nhật');
    }

    const roles = updatedUser.roles || [];
    const roleNames = roles.map((role) => role.roleName);

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      status: updateStatusDto.status, // Use the status from DTO instead of querying again
      roles: roleNames,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }
}

