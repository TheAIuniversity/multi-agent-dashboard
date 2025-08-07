const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

class UserFactory {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Generate user data without saving to database
   */
  build(overrides = {}) {
    const userData = {
      id: faker.string.uuid(),
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYLXXzQgJbAMJn.', // "password"
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return userData;
  }

  /**
   * Create user in database
   */
  async create(overrides = {}) {
    const userData = this.build(overrides);
    
    // Hash password if provided as plain text
    if (overrides.password) {
      userData.passwordHash = await bcrypt.hash(overrides.password, 12);
      delete userData.password;
    }

    return await this.prisma.user.create({
      data: userData
    });
  }

  /**
   * Create multiple users
   */
  async createMany(count = 3, overrides = {}) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create({
        ...overrides,
        email: `test${i}+${Date.now()}@example.com`
      });
      users.push(user);
    }
    return users;
  }

  /**
   * Create admin user
   */
  async createAdmin(overrides = {}) {
    return await this.create({
      email: 'admin@example.com',
      name: 'Admin User',
      ...overrides
    });
  }

  /**
   * Create user with organization
   */
  async createWithOrganization(orgData = {}, userOverrides = {}) {
    const user = await this.create(userOverrides);
    
    const organization = await this.prisma.organization.create({
      data: {
        id: faker.string.uuid(),
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...orgData
      }
    });

    return { user, organization };
  }

  /**
   * Create user with team membership
   */
  async createWithTeam(teamData = {}, userOverrides = {}) {
    const { user, organization } = await this.createWithOrganization({}, userOverrides);
    
    const team = await this.prisma.team.create({
      data: {
        id: faker.string.uuid(),
        organizationId: organization.id,
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...teamData
      }
    });

    await this.prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: 'member',
        joinedAt: new Date()
      }
    });

    return { user, organization, team };
  }

  /**
   * Create user with valid JWT token
   */
  async createWithToken(userOverrides = {}) {
    const user = await this.create(userOverrides);
    
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roles: ['user']
    };

    const token = global.testUtils.generateJWT(tokenPayload);
    
    return { user, token, tokenPayload };
  }

  /**
   * Create user with refresh token
   */
  async createWithRefreshToken(userOverrides = {}) {
    const user = await this.create(userOverrides);
    
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        id: faker.string.uuid(),
        userId: user.id,
        tokenHash: faker.string.alphanumeric(64),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date()
      }
    });

    return { user, refreshToken };
  }
}

module.exports = UserFactory;