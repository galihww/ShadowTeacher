import { sql, initDB } from './db';
import { User, UserRole, Gender } from '../types';
import bcrypt from 'bcryptjs';

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    // 1. Fetch user by username ONLY (do not check password in SQL)
    const users = await sql`
      SELECT id, username, email, name, role, gender, password
      FROM users 
      WHERE username = ${username}
    `;
    
    if (users.length > 0) {
      const userRecord = users[0];
      
      // 2. Verify Password
      let isMatch = false;

      // Check if password stored is hashed (Bcrypt hashes usually start with $2a$ or $2b$)
      if (userRecord.password.startsWith('$2')) {
          isMatch = await bcrypt.compare(password, userRecord.password);
      } else {
          // FALLBACK: Check Plain Text (for existing seed data or migrated data)
          // In production, we should auto-hash this and update the DB, but for now we just allow login.
          isMatch = userRecord.password === password;
      }

      if (isMatch) {
        return {
          id: userRecord.id,
          username: userRecord.username,
          email: userRecord.email || '',
          name: userRecord.name,
          role: userRecord.role as UserRole,
          gender: userRecord.gender as Gender
        };
      }
    }
    return null;
  } catch (error: any) {
    // Auto-heal: Try to init DB if table missing
    if (error.message?.includes('relation "users" does not exist')) {
        console.warn("Table 'users' missing. Initializing DB and retrying...");
        try {
            await initDB();
            // Retry logic would go here, but avoiding infinite recursion.
            return null;
        } catch (retryError) {
            console.error("Retry failed:", retryError);
        }
    }

    console.error("Login error:", error);
    // Fallback logic for demo if DB fails (Offline mock)
    // Note: In offline mode, we check plain text for simplicity
    if (username === 'admin' && password === 'admin123') return { id: '1', username: 'admin', email: 'admin@test.com', name: 'Administrator', role: UserRole.ADMIN, gender: Gender.MALE };
    if (username === 'shadow' && password === 'shadow123') return { id: '2', username: 'shadow', email: 'shadow@test.com', name: 'Shadow Teacher', role: UserRole.SHADOW_TEACHER, gender: Gender.FEMALE };
    if (username === 'guru' && password === 'guru123') return { id: '3', username: 'guru', email: 'guru@test.com', name: 'Guru Pendamping', role: UserRole.TEACHER, gender: Gender.FEMALE };
    if (username === 'ortu' && password === 'ortu123') return { id: '4', username: 'ortu', email: 'ortu@test.com', name: 'Orang Tua', role: UserRole.PARENT, gender: Gender.MALE };
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const rows = await sql`SELECT id, username, email, name, role, gender FROM users ORDER BY name ASC`;
    return rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      email: r.email || '',
      name: r.name,
      role: r.role as UserRole,
      gender: r.gender as Gender
    }));
  } catch (error: any) {
    if (error.message?.includes('relation "users" does not exist')) {
        console.warn("Table 'users' missing during fetch. Initializing DB...");
        await initDB();
        try {
             const rows = await sql`SELECT id, username, email, name, role, gender FROM users ORDER BY name ASC`;
             return rows.map((r: any) => ({
                id: r.id,
                username: r.username,
                email: r.email || '',
                name: r.name,
                role: r.role as UserRole,
                gender: r.gender as Gender
             }));
        } catch (e) { 
            console.error("Retry fetch users failed:", e); 
        }
    }
    console.error("Get Users Error:", error);
    return [];
  }
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const rows = await sql`SELECT id, username, email, name, role, gender FROM users WHERE role = ${role} ORDER BY name ASC`;
    return rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      email: r.email || '',
      name: r.name,
      role: r.role as UserRole,
      gender: r.gender as Gender
    }));
  } catch (error) {
    console.error(`Get Users by Role (${role}) Error:`, error);
    return [];
  }
};

export const createUser = async (user: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
  try {
    const id = Date.now().toString();
    
    // Hash Password before inserting
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    await sql`
      INSERT INTO users (id, username, email, password, name, role, gender)
      VALUES (${id}, ${user.username}, ${user.email}, ${hashedPassword}, ${user.name}, ${user.role}, ${user.gender})
    `;
    return true;
  } catch (error) {
    console.error("Create User Error:", error);
    return false;
  }
};

export const updateUser = async (user: User & { password?: string }): Promise<boolean> => {
    try {
        if (user.password && user.password.trim() !== "") {
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await sql`
                UPDATE users 
                SET name = ${user.name}, username = ${user.username}, email = ${user.email}, role = ${user.role}, password = ${hashedPassword}, gender = ${user.gender}
                WHERE id = ${user.id}
            `;
        } else {
            // Update without changing password
            await sql`
                UPDATE users 
                SET name = ${user.name}, username = ${user.username}, email = ${user.email}, role = ${user.role}, gender = ${user.gender}
                WHERE id = ${user.id}
            `;
        }
        return true;
    } catch (error) {
        console.error("Update User Error:", error);
        return false;
    }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error("Delete User Error:", error);
    return false;
  }
};
