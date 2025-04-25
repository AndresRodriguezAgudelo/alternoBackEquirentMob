import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "@/modules/user/services/user.service";
import { JwtService } from "@nestjs/jwt";
import { NotFoundException, NotAcceptableException } from "@nestjs/common";
import { compareSync } from "bcryptjs";
import { IUser } from "@/interfaces/user.interface";

// mock compareSync
jest.mock("bcryptjs", () => ({
  compareSync: jest.fn(),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let userService: Partial<jest.Mocked<UserService>>;
  let jwtService: Partial<jest.Mocked<JwtService>>;

  beforeEach(async () => {
    userService = {
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validate", () => {
    it("should throw NotFoundException if user not found", async () => {
      userService.findOne!.mockResolvedValue(null);

      await expect(
        authService.validate("test@example.com", "pass"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotAcceptableException if password mismatches", async () => {
      userService.findOne!.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPass",
      } as any);
      (compareSync as jest.Mock).mockReturnValue(false);

      await expect(
        authService.validate("test@example.com", "wrong"),
      ).rejects.toThrow(NotAcceptableException);
    });

    it("should return user object (minus password) if password matches", async () => {
      userService.findOne!.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPass",
        someField: "someValue",
      } as any);
      (compareSync as jest.Mock).mockReturnValue(true);

      const result = await authService.validate("test@example.com", "correct");
      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        someField: "someValue",
      });
    });
  });

  describe("validateUser", () => {
    it("should throw NotFoundException if user not found by phone", async () => {
      userService.findOne!.mockResolvedValue(null);

      await expect(
        authService.validateUser("3001234567", "1234"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return user if found", async () => {
      userService.findOne!.mockResolvedValue({
        id: 2,
        phone: "3001234567",
      } as any);

      const result = await authService.validateUser("3001234567", "1234");
      expect(result).toEqual({ id: 2, phone: "3001234567" });
    });
  });

  describe("login", () => {
    it("should return user and signed accessToken", async () => {
      jwtService.sign!.mockReturnValue("signed-jwt");
      const user: IUser = { id: 3, email: "login@example.com" } as any;

      const result = await authService.login(user);
      expect(result).toEqual({
        user,
        accessToken: "signed-jwt",
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 3 });
    });
  });

  describe("getTokenRegisteredUser", () => {
    it("should throw NotFound if user not found", async () => {
      userService.findOne!.mockResolvedValue(null);

      await expect(authService.getTokenRegisteredUser(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return signed token if user found", async () => {
      userService.findOne!.mockResolvedValue({
        id: 44,
        email: "",
        password: "",
      } as any);
      jwtService.sign!.mockReturnValue("registered-jwt");

      const result = await authService.getTokenRegisteredUser(44);
      expect(result).toBe("registered-jwt");
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 44 });
    });
  });
});
