'use client'

import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser.ts";
import { getAuth } from "firebase/auth";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import ProfileClient from "./ProfileClient";

const ProfilePage = () => {
    const { currentUser, loading: userLoading } = useCurrentUser();
    const [stats, setStats] = useState({
        properties: 0,
        reservations: 0,
        trips: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const auth = getAuth();
                const firebaseUser = auth.currentUser;
                
                if (!firebaseUser) {
                    setLoading(false);
                    return;
                }

                // Fetch user statistics
                const [propertiesRes, reservationsRes, tripsRes] = await Promise.all([
                    fetch(`/api/listings?userId=${currentUser.id}`),
                    fetch(`/api/reservations?authorId=${currentUser.id}`),
                    fetch(`/api/reservations?userId=${currentUser.id}`, {
                        headers: { 'x-firebase-uid': firebaseUser.uid }
                    })
                ]);

                const [properties, reservations, trips] = await Promise.all([
                    propertiesRes.ok ? propertiesRes.json() : [],
                    reservationsRes.ok ? reservationsRes.json() : [],
                    tripsRes.ok ? tripsRes.json() : []
                ]);

                setStats({
                    properties: properties.length,
                    reservations: reservations.length,
                    trips: trips.length
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!userLoading) {
            fetchStats();
        }
    }, [currentUser, userLoading]);

    if (userLoading || loading) {
        return <Loader />;
    }

    if (!currentUser) {
        return (
            <EmptyState title="Unauthorized" subtitle="Please login to view your profile" />
        );
    }

    return (
        <ProfileClient currentUser={currentUser} stats={stats} />
    );
};

export default ProfilePage;