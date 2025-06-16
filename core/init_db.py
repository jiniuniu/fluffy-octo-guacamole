import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from core.storage_client import Base

load_dotenv()


def get_database_url():
    """Construct database URL from environment variables"""
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = os.environ.get("DB_PORT", "5432")
    db_name = os.environ.get("DB_NAME")
    db_user = os.environ.get("DB_USER")
    db_password = os.environ.get("DB_PASSWORD")

    if not all([db_name, db_user, db_password]):
        missing = []
        if not db_name:
            missing.append("DB_NAME")
        if not db_user:
            missing.append("DB_USER")
        if not db_password:
            missing.append("DB_PASSWORD")

        print(f"❌ Missing required environment variables: {', '.join(missing)}")
        print("\nPlease set the following in your .env file:")
        print("DB_HOST=localhost")
        print("DB_PORT=5432")
        print("DB_NAME=your_database_name")
        print("DB_USER=your_username")
        print("DB_PASSWORD=your_password")
        return None

    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


def create_database_if_not_exists(
    db_host,
    db_port,
    db_user,
    db_password,
    db_name,
):
    """Create database if it doesn't exist"""
    # Connect to PostgreSQL server (using 'postgres' default database)
    server_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/postgres"

    try:
        engine = create_engine(server_url)
        with engine.connect() as conn:
            # Check if database exists
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": db_name},
            )

            if result.fetchone():
                print(f"✅ Database '{db_name}' already exists")
                return True
            else:
                print(f"🔨 Creating database '{db_name}'...")
                # Need to commit manually for CREATE DATABASE
                conn.execute(text("COMMIT"))
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                print(f"✅ Database '{db_name}' created successfully")
                return True

    except OperationalError as e:
        if "database" in str(e).lower() and "does not exist" in str(e).lower():
            print(f"❌ Cannot connect to PostgreSQL server: {e}")
            print("💡 Make sure PostgreSQL is running and credentials are correct")
        else:
            print(f"❌ Error creating database: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error creating database: {e}")
        return False


def test_connection(engine):
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version[:50]}...")
            return True
    except OperationalError as e:
        print(f"❌ Connection failed: {e}")
        return False


def check_existing_tables(engine):
    """Check which tables already exist"""
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """
                )
            )
            existing_tables = [row[0] for row in result.fetchall()]

            if existing_tables:
                print(f"📋 Existing tables: {', '.join(existing_tables)}")
            else:
                print("📋 No existing tables found")

            return existing_tables
    except Exception as e:
        print(f"⚠️  Could not check existing tables: {e}")
        return []


def create_tables(engine, force=False):
    """Create all tables defined in the models"""
    try:
        existing_tables = check_existing_tables(engine)

        # Check if any of our tables already exist
        our_tables = {
            "users",
            "threads",
            "steps",
            "elements",
            "feedbacks",
            "langgraphs",
        }
        existing_our_tables = set(existing_tables) & our_tables

        if existing_our_tables and not force:
            print(f"⚠️  Some tables already exist: {', '.join(existing_our_tables)}")
            print(
                "Use --force flag to recreate existing tables (THIS WILL DELETE DATA!)"
            )
            return False

        if force and existing_our_tables:
            print(f"🗑️  Dropping existing tables: {', '.join(existing_our_tables)}")
            Base.metadata.drop_all(engine)
            print("✅ Existing tables dropped")

        print("🔨 Creating tables...")
        Base.metadata.create_all(engine)
        print("✅ All tables created successfully!")

        # Verify tables were created
        new_tables = check_existing_tables(engine)
        created_tables = set(new_tables) & our_tables
        print(f"📋 Created tables: {', '.join(created_tables)}")

        return True

    except SQLAlchemyError as e:
        print(f"❌ Error creating tables: {e}")
        return False


def show_table_info(engine):
    """Show information about created tables"""
    try:
        with engine.connect() as conn:
            print("\n📊 Table Information:")
            print("-" * 50)

            for table_name in [
                "users",
                "threads",
                "steps",
                "elements",
                "feedbacks",
                "langgraphs",
            ]:
                try:
                    result = conn.execute(
                        text(
                            f"""
                        SELECT column_name, data_type, is_nullable, column_default
                        FROM information_schema.columns 
                        WHERE table_name = '{table_name}' 
                        ORDER BY ordinal_position
                    """
                        )
                    )

                    columns = result.fetchall()
                    if columns:
                        print(f"\n🔧 {table_name.upper()} table:")
                        for col in columns:
                            nullable = "NULL" if col[2] == "YES" else "NOT NULL"
                            default = f" DEFAULT {col[3]}" if col[3] else ""
                            print(f"   • {col[0]}: {col[1]} {nullable}{default}")
                except Exception:
                    pass

    except Exception as e:
        print(f"⚠️  Could not retrieve table information: {e}")


def main():
    """Main function to initialize the database"""
    print("🚀 Database Initialization Script")
    print("=" * 40)

    # Check for force flag
    force = "--force" in sys.argv
    if force:
        print("⚠️  FORCE MODE: Will recreate existing tables!")

    # Get database URL and validate environment variables
    database_url = get_database_url()
    if not database_url:
        return 1

    # Extract database connection info for database creation
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = os.environ.get("DB_PORT", "5432")
    db_name = os.environ.get("DB_NAME")
    db_user = os.environ.get("DB_USER")
    db_password = os.environ.get("DB_PASSWORD")

    # Create database if it doesn't exist
    print(f"🔍 Checking if database '{db_name}' exists...")
    if not create_database_if_not_exists(
        db_host, db_port, db_user, db_password, db_name
    ):
        return 1

    print(f"🔗 Database URL: {database_url.replace(db_password, '***')}")

    try:
        # Create engine
        engine = create_engine(database_url, echo=False)

        # Test connection
        if not test_connection(engine):
            return 1

        # Create tables
        if create_tables(engine, force=force):
            show_table_info(engine)
            print("\n🎉 Database initialization completed successfully!")
            return 0
        else:
            return 1

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
