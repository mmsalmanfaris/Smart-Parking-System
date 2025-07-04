from typing import Optional
from models.admin_model import adminModel, adminResponse, adminUpdate
from config.firebase_config import _db
from firebase_admin import auth, firestore


def create_admin(admin_data: adminModel):
    try:
        # Create a new admin user in Firebase Authentication
        admin = auth.create_user(
            email=admin_data.email,  # Access email as an attribute of the Pydantic model
            password=admin_data.password  # Access password as an attribute of the Pydantic model
        )

        # Set custom claims for admin role
        auth.set_custom_user_claims(admin.uid, {
            "role": "admin"
        })

        print(f"Admin Created with UID: {admin.uid}")

        # Store admin details in Firestore
        admin_ref = _db.collection("Admin").document(admin.uid)
        admin_ref.set({
            "name": admin_data.name,  # Access name as an attribute of the Pydantic model
            "address": admin_data.address,
            "nic": admin_data.nic,
            "gender": admin_data.gender,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return {"message": "Admin Created Successfully", "Admin_Id": admin.uid}

    except Exception as e:
        raise ValueError(f"Error during admin registration service: {str(e)}")




def get_all_admins():
    try:
        # Fetch all admin documents from Firestore
        admins_ref = _db.collection("Admin").stream()
        firestore_admins = {doc.id: doc.to_dict() for doc in admins_ref}  # Use UID as the key

        # Fetch all users from Firebase Authentication
        firebase_users = auth.list_users().users

        # Combine Firestore and Firebase Authentication data
        combined_admins = []
        for user in firebase_users:
            uid = user.uid
            if uid in firestore_admins:  # Check if the UID exists in Firestore
                firestore_data = firestore_admins[uid]
                combined_admins.append({
                    "id": uid,
                    "name": firestore_data.get("name"),
                    "email": user.email,  # Email from Firebase Auth
                    "address": firestore_data.get("address"),
                    "nic": firestore_data.get("nic"),
                    "gender": firestore_data.get("gender"),
                    "created_at": firestore_data.get("created_at")
                })

        return combined_admins

    except Exception as e:
        raise ValueError(f"Error fetching admins: {str(e)}")


def get_admin_by_id(admin_id: str):
    try:
        # Fetch authentication details from Firebase
        auth_details = auth.get_user(admin_id)
        if not auth_details:
            raise ValueError("Authentication details not found")

        # Fetch Firestore details
        admin_ref = _db.collection("Admin").document(admin_id).get()
        if not admin_ref.exists:
            raise ValueError("Firestore details not found")

        firestore_data = admin_ref.to_dict()

        # Combine data (exclude password since it's not available)
        combined_data = {
            "id": admin_id,
            "name": firestore_data.get("name"),
            "address": firestore_data.get("address"),
            "nic": firestore_data.get("nic"),
            "gender": firestore_data.get("gender"),
            "email": auth_details.email,  # Email comes from Firebase Auth
        }

        # Validate and return the combined data
        return adminResponse(**combined_data)

    except Exception as e:
        print(f"Error fetching admin details: {e}")
        return None


def update_admin(admin_id: str, updated_data: dict):
    print(admin_id)
    try:
        admin_ref = _db.collection("Admin").document(admin_id)
        admin_doc = admin_ref.get()

        if not admin_doc.exists:
            return False

        existing_data = admin_doc.to_dict()

        # Exclude email and password for Firestore update
        firestore_update = {key: value for key, value in updated_data.items() if key not in ["email", "password"]}
        updated_firestore_data = {**existing_data, **firestore_update}
        admin_ref.set(updated_firestore_data)

        if "email" in updated_data or "password" in updated_data:
            user = auth.get_user(admin_id)
            update_args = {}
            if "email" in updated_data:
                update_args["email"] = updated_data["email"]
            if "password" in updated_data:
                update_args["password"] = updated_data["password"]
            auth.update_user(user.uid, **update_args)

        return True

    except Exception as e:
        print(f"Error updating admin: {e}")
        return {"error": "Failed to update admin"}



def delete_admin(admin_id: str) -> bool:

    try:
        auth.delete_user(admin_id)
        print(f"Admin Deleted: {admin_id}")
    except Exception as e:
        print(f"Error delete admin: {e}")

    admin_ref = _db.collection("Admin").document(admin_id)
    if admin_ref.get().exists:
        admin_ref.delete()
        return {"message": "Admin Deleted Successfully", "Admin_Id": admin_id}
    return False


    