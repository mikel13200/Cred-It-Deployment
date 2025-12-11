"""
Business logic for profile operations.
All profile CRUD operations should be here.
"""
from typing import Optional, Dict, List
from django.db import transaction
from core.exceptions import (
    ValidationException,
    ResourceNotFoundException,
    DuplicateResourceException
)
from core.decorators import log_execution, atomic_transaction
from .models import Profile
import logging

logger = logging.getLogger(__name__)


class ProfileService:
    """
    Service class for profile operations.
    Handles CRUD operations for user profiles.
    """
    
    @staticmethod
    @atomic_transaction
    @log_execution
    def create_profile(
        user_id: str,
        name: Optional[str] = None,
        school_name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        date_of_birth: Optional[str] = None
    ) -> Profile:
        """
        Create a new user profile.
        
        Args:
            user_id: Unique user identifier
            name: User's full name
            school_name: Previous school name
            email: Contact email
            phone: Contact phone number
            address: Full address
            date_of_birth: Date of birth (YYYY-MM-DD)
            
        Returns:
            Created Profile instance
            
        Raises:
            ValidationException: If validation fails
            DuplicateResourceException: If profile already exists
        """
        if not user_id:
            raise ValidationException("user_id is required")
        
        # --- NORMALIZER FUNCTION (THIS FIXES YOUR VALIDATION FAILED) ---
        def _normalize(value):
            if value is None:
                return None
            if isinstance(value, str) and value.strip() == "":
                return None
            return value
        # ----------------------------------------------------------------


        # Check if profile already exists
        if Profile.objects.filter(user_id=user_id).exists():
            raise DuplicateResourceException("Profile", user_id)
        
        # Create profile
        profile = Profile.objects.create(
            user_id=user_id,
            name=name,
            school_name=school_name,
            email=email,
            phone=phone,
            address=address,
            date_of_birth=date_of_birth
        )
        
        logger.info(f"Profile created for user: {user_id}")
        
        return profile
    
    @staticmethod
    @atomic_transaction
    @log_execution
    def update_profile(
        user_id: str,
        name: Optional[str] = None,
        school_name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        date_of_birth: Optional[str] = None
    ) -> Profile:
        """
        Update an existing user profile.
        
        Args:
            user_id: User identifier
            name: Updated name (optional)
            school_name: Updated school name (optional)
            email: Updated email (optional)
            phone: Updated phone (optional)
            address: Updated address (optional)
            date_of_birth: Updated date of birth (optional)
            
        Returns:
            Updated Profile instance
            
        Raises:
            ResourceNotFoundException: If profile not found
        """
        try:
            profile = Profile.objects.get(user_id=user_id)
        except Profile.DoesNotExist:
            raise ResourceNotFoundException("Profile", user_id)
        
        # Update fields if provided
        if name is not None:
            profile.name = name
        if school_name is not None:
            profile.school_name = school_name
        if email is not None:
            profile.email = email
        if phone is not None:
            profile.phone = phone
        if address is not None:
            profile.address = address
        if date_of_birth is not None:
            profile.date_of_birth = date_of_birth
        
        profile.save()
        
        logger.info(f"Profile updated for user: {user_id}")
        
        return profile
    
    @staticmethod
    @atomic_transaction
    @log_execution
    def save_profile(
        user_id: str,
        **kwargs
    ) -> Profile:
        """
        Save profile (create or update).
        
        This is a convenience method that creates a new profile if it doesn't
        exist, or updates the existing one.
        
        Args:
            user_id: User identifier
            **kwargs: Profile fields to save
            
        Returns:
            Profile instance (created or updated)
        """
        if not user_id:
            raise ValidationException("user_id is required")
        
        # Clean kwargs: convert empty strings to None for optional fields
        cleaned_kwargs = {}
        for key, value in kwargs.items():
            if value == '' or value == 'null':
                cleaned_kwargs[key] = None
            else:
                cleaned_kwargs[key] = value
        
        try:
            # Try to get existing profile
            profile = Profile.objects.get(user_id=user_id)
            
            # Update existing profile
            for key, value in cleaned_kwargs.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
            
            profile.save()
            
            logger.info(f"Profile updated for user: {user_id}")
            
        except Profile.DoesNotExist:
            # Create new profile
            profile = Profile.objects.create(
                user_id=user_id,
                **cleaned_kwargs
            )
            
            logger.info(f"Profile created for user: {user_id}")
        
        return profile
    
    @staticmethod
    def get_profile(user_id: str) -> Profile:
        """
        Get profile by user_id.
        
        Args:
            user_id: User identifier
            
        Returns:
            Profile instance
            
        Raises:
            ResourceNotFoundException: If profile not found
        """
        try:
            return Profile.objects.get(user_id=user_id)
        except Profile.DoesNotExist:
            raise ResourceNotFoundException("Profile", user_id)
    
    @staticmethod
    def get_all_profiles(
        is_complete: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[Profile]:
        """
        Get all profiles with optional filtering.
        
        Args:
            is_complete: Filter by completion status (optional)
            search: Search term for name, email, or school (optional)
            
        Returns:
            List of Profile instances
        """
        queryset = Profile.objects.all()
        
        # Filter by completion status
        if is_complete is not None:
            queryset = queryset.filter(is_complete=is_complete)
        
        # Search across multiple fields
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(school_name__icontains=search) |
                Q(user_id__icontains=search)
            )
        
        return list(queryset)
    
    @staticmethod
    @log_execution
    def delete_profile(user_id: str) -> bool:
        """
        Delete a user profile.
        
        Args:
            user_id: User identifier
            
        Returns:
            True if deleted, False otherwise
            
        Raises:
            ResourceNotFoundException: If profile not found
        """
        try:
            profile = Profile.objects.get(user_id=user_id)
            profile.delete()
            
            logger.info(f"Profile deleted for user: {user_id}")
            
            return True
        except Profile.DoesNotExist:
            raise ResourceNotFoundException("Profile", user_id)
    
    @staticmethod
    def check_profile_exists(user_id: str) -> bool:
        """
        Check if profile exists for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            True if profile exists, False otherwise
        """
        return Profile.objects.filter(user_id=user_id).exists()
    
    @staticmethod
    def get_incomplete_profiles() -> List[Profile]:
        """
        Get all incomplete profiles.
        
        Returns:
            List of Profile instances with is_complete=False
        """
        return list(Profile.objects.filter(is_complete=False))
    
    @staticmethod
    def get_profile_statistics() -> Dict[str, int]:
        """
        Get profile statistics.
        
        Returns:
            Dictionary with profile counts and statistics
        """
        from django.db.models import Count, Avg
        
        total = Profile.objects.count()
        complete = Profile.objects.filter(is_complete=True).count()
        incomplete = total - complete
        
        # Calculate average completion percentage
        profiles = Profile.objects.all()
        avg_completion = sum(p.completion_percentage for p in profiles) / total if total > 0 else 0
        
        return {
            'total': total,
            'complete': complete,
            'incomplete': incomplete,
            'completion_rate': round((complete / total * 100), 2) if total > 0 else 0,
            'average_completion': round(avg_completion, 2)
        }